import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import { bitrix24Service, Bitrix24Contact } from '@/services/bitrix24';

interface ContactListProps {
  refreshTrigger?: number;
  onContactSelect?: (contact: Bitrix24Contact) => void;
}

export function ContactList({ refreshTrigger, onContactSelect }: ContactListProps) {
  const [contacts, setContacts] = useState<Bitrix24Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contactList = await bitrix24Service.getContacts({
        select: ['ID', 'NAME', 'LAST_NAME', 'COMPANY_TITLE', 'EMAIL', 'PHONE', 'SOURCE_ID', 'ASSIGNED_BY_ID', 'CREATED_TIME'],
        filter: {} // Можно добавить фильтры по необходимости
      });
      
      setContacts(contactList || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки контактов';
      setError(errorMessage);
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [refreshTrigger]);

  const getContactName = (contact: Bitrix24Contact) => {
    const firstName = contact.NAME || '';
    const lastName = contact.LAST_NAME || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    if (fullName) return fullName;
    if (contact.COMPANY_TITLE) return contact.COMPANY_TITLE;
    return `Контакт #${contact.ID}`;
  };

  const getContactEmail = (contact: Bitrix24Contact) => {
    if (!contact.EMAIL || !Array.isArray(contact.EMAIL) || contact.EMAIL.length === 0) {
      return null;
    }
    return contact.EMAIL[0].VALUE;
  };

  const getContactPhone = (contact: Bitrix24Contact) => {
    if (!contact.PHONE || !Array.isArray(contact.PHONE) || contact.PHONE.length === 0) {
      return null;
    }
    return contact.PHONE[0].VALUE;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleContactClick = (contact: Bitrix24Contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadContacts} variant="outline">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Повторить попытку
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={24} className="text-blue-600" />
          <h2 className="text-2xl font-bold">Контакты Битрикс24</h2>
          <Badge variant="outline">{contacts.length}</Badge>
        </div>
        <Button onClick={loadContacts} variant="outline" size="sm">
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icon name="Users" size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Контакты не найдены</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card 
              key={contact.ID} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleContactClick(contact)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      {getContactName(contact)}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 text-sm">
                      <span>ID: {contact.ID}</span>
                      {contact.ASSIGNED_BY_ID && (
                        <>
                          <span>•</span>
                          <span>Ответственный: {contact.ASSIGNED_BY_ID}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  {contact.COMPANY_TITLE && (
                    <Badge variant="secondary" className="ml-4">
                      {contact.COMPANY_TITLE}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {getContactEmail(contact) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Icon name="Mail" size={16} className="text-blue-500" />
                      <span>{getContactEmail(contact)}</span>
                    </div>
                  )}
                  
                  {getContactPhone(contact) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Icon name="Phone" size={16} className="text-green-500" />
                      <span>{getContactPhone(contact)}</span>
                    </div>
                  )}
                  
                  {contact.SOURCE_ID && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Icon name="Tag" size={16} className="text-purple-500" />
                      <span>Источник: {contact.SOURCE_ID}</span>
                    </div>
                  )}
                </div>
                
                {contact.CREATED_TIME && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={12} />
                      <span>Создан: {formatDate(contact.CREATED_TIME)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContactList;