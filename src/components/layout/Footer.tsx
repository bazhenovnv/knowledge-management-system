import Icon from "@/components/ui/icon";

export const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-emerald-100 to-blue-50 border-t border-gray-200 shadow-inner" style={{ height: '1.5cm' }}>
      <div className="h-full flex items-center justify-center px-4">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-700">
          <span className="font-semibold">Автоматизация бизнеса</span>
          <span className="hidden sm:inline">•</span>
          <span>Краснодар 2016г.-2025г.</span>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <Icon name="Phone" size={12} className="text-emerald-600" />
            <a href="tel:+79385231781" className="hover:text-emerald-600 transition-colors">
              +7(938) 523-17-81
            </a>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <Icon name="Mail" size={12} className="text-emerald-600" />
            <a href="mailto:n.bazhenov@a-b.ru" className="hover:text-emerald-600 transition-colors">
              n.bazhenov@a-b.ru
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
