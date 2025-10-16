import { toast } from 'sonner';

export const scanForJunkCode = () => {
  const results: string[] = [];
  const issues: string[] = [];
  
  const htmlContent = document.documentElement.outerHTML;
  
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script, index) => {
    if (script.src && !script.src.includes(window.location.hostname)) {
      issues.push(`Внешний скрипт #${index + 1}: ${script.src}`);
    }
    if (script.innerHTML && script.innerHTML.length > 1000) {
      issues.push(`Большой инлайн-скрипт #${index + 1}: ${script.innerHTML.length} символов`);
    }
  });
  
  const deprecatedTags = ['marquee', 'blink', 'center', 'font', 'frame', 'frameset'];
  deprecatedTags.forEach(tag => {
    const elements = document.querySelectorAll(tag);
    if (elements.length > 0) {
      issues.push(`Устаревший тег <${tag}>: найдено ${elements.length} шт.`);
    }
  });
  
  const emptyDivs = Array.from(document.querySelectorAll('div')).filter(
    div => !div.textContent?.trim() && !div.querySelector('img, svg, video, iframe') && div.children.length === 0
  );
  if (emptyDivs.length > 5) {
    issues.push(`Пустые <div>: найдено ${emptyDivs.length} шт.`);
  }
  
  const inlineStyles = document.querySelectorAll('[style]');
  if (inlineStyles.length > 50) {
    issues.push(`Много инлайн-стилей: ${inlineStyles.length} элементов`);
  }
  
  const elementsWithManyClasses = Array.from(document.querySelectorAll('*')).filter(
    el => {
      if (!el.className) return false;
      const className = typeof el.className === 'string' ? el.className : el.className.baseVal || '';
      const classCount = className.split(' ').filter(c => c.trim()).length;
      
      const ignoredSelectors = ['[data-radix', '[data-state', '[cmdk-', '[role="dialog"]', '[role="menu"]'];
      const shouldIgnore = ignoredSelectors.some(selector => {
        try {
          return el.matches(selector + '*]') || el.closest(selector + '*]');
        } catch {
          return false;
        }
      });
      
      return classCount > 20 && !shouldIgnore;
    }
  );
  if (elementsWithManyClasses.length > 0) {
    issues.push(`Элементы с избыточными классами: ${elementsWithManyClasses.length} шт.`);
    elementsWithManyClasses.slice(0, 3).forEach((el, i) => {
      const className = typeof el.className === 'string' ? el.className : el.className.baseVal || '';
      const classCount = className.split(' ').filter(c => c.trim()).length;
      issues.push(`  └─ Элемент #${i + 1}: ${el.tagName.toLowerCase()} (${classCount} классов)`);
    });
  }
  
  const comments = htmlContent.match(/<!--[\s\S]*?-->/g) || [];
  if (comments.length > 10) {
    issues.push(`HTML комментарии: ${comments.length} шт.`);
  }
  
  const longDataAttrs = Array.from(document.querySelectorAll('*')).filter(el => {
    return Array.from(el.attributes).some(attr => 
      attr.name.startsWith('data-') && attr.value.length > 500
    );
  });
  if (longDataAttrs.length > 0) {
    issues.push(`Data-атрибуты >500 символов: ${longDataAttrs.length} шт.`);
  }
  
  const hiddenElements = document.querySelectorAll('[hidden], [style*="display: none"], [style*="visibility: hidden"]');
  if (hiddenElements.length > 20) {
    issues.push(`Скрытые элементы: ${hiddenElements.length} шт.`);
  }
  
  if (issues.length === 0) {
    console.log('✓ Сканирование завершено: проблем не найдено');
    toast.success('Код чистый! Проблем не найдено');
  } else {
    const issuesList = issues.map(issue => `  • ${issue}`).join('\n');
    console.warn(`⚠️ Найдено проблем: ${issues.length}\n${issuesList}`);
    toast.warning(`Найдено проблем: ${issues.length}`, {
      description: 'Нажмите "Исправить проблемы" для автоматической очистки'
    });
  }
  
  console.log(`
📊 Статистика сканирования:
- Всего элементов: ${document.querySelectorAll('*').length}
- Скриптов: ${scripts.length}
- Стилей (инлайн): ${inlineStyles.length}
- Комментариев: ${comments.length}
- Проблем: ${issues.length}
  `);
  
  return issues.length;
};

export const fixJunkCode = () => {
  let fixed = 0;
  
  const emptyDivs = Array.from(document.querySelectorAll('div')).filter(
    div => !div.textContent?.trim() && 
           !div.querySelector('img, svg, video, iframe, canvas, input, button, select, textarea') && 
           div.children.length === 0 &&
           !div.id &&
           !div.getAttribute('data-radix-portal')
  );
  emptyDivs.forEach(div => {
    div.remove();
    fixed++;
  });
  
  const deprecatedTags = ['marquee', 'blink', 'center', 'font'];
  deprecatedTags.forEach(tag => {
    document.querySelectorAll(tag).forEach(el => {
      const parent = el.parentElement;
      if (parent) {
        parent.insertBefore(document.createTextNode(el.textContent || ''), el);
        el.remove();
        fixed++;
      }
    });
  });
  
  const inlineStyles = Array.from(document.querySelectorAll('[style]')).filter(el => {
    return !el.closest('[data-radix-portal], [data-sonner-toaster]') && 
           !el.getAttribute('data-state');
  });
  
  inlineStyles.slice(0, 10).forEach(el => {
    const style = el.getAttribute('style') || '';
    
    if (style.includes('display: none') || style.includes('display:none')) {
      el.classList.add('hidden');
      el.removeAttribute('style');
      fixed++;
    } else if (style.includes('visibility: hidden')) {
      el.classList.add('invisible');
      el.removeAttribute('style');
      fixed++;
    }
  });
  
  if (fixed > 0) {
    console.log(`✓ Исправлено проблем: ${fixed}`);
    toast.success(`Исправлено ${fixed} проблем`, {
      description: 'Удалены пустые элементы, устаревшие теги и оптимизированы стили'
    });
    
    setTimeout(() => {
      scanForJunkCode();
    }, 500);
  } else {
    toast.info('Нет проблем для автоматического исправления');
  }
};
