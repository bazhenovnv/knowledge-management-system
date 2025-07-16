import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Icon from "@/components/ui/icon";
import { useAI, AIMessage } from "@/hooks/useAI";

interface AIChatProps {
  className?: string;
}

export const AIChat = ({ className = "" }: AIChatProps) => {
  const [inputValue, setInputValue] = useState("");
  const [lastResponse, setLastResponse] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, error, sendMessage, clearMessages } = useAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const response = await sendMessage(inputValue);
    setInputValue("");
    setLastResponse(response);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <Card
      className={`${className} bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Icon name="Bot" size={24} className="mr-2 text-purple-600" />
            AI Помощник
          </CardTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icon name="Trash2" size={16} className="mr-1" />
              Очистить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length > 0 && (
          <ScrollArea className="h-80 w-full rounded-lg border bg-white p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                  <span className="text-sm">AI думает...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {lastResponse?.suggestions && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Рекомендации:</p>
            <div className="flex flex-wrap gap-2">
              {lastResponse.suggestions.map(
                (suggestion: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-purple-100"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ),
              )}
            </div>
          </div>
        )}

        {lastResponse?.relatedTopics && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Связанные темы:</p>
            <div className="flex flex-wrap gap-2">
              {lastResponse.relatedTopics.map(
                (topic: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleSuggestionClick(topic)}
                  >
                    {topic}
                  </Badge>
                ),
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            placeholder="Ваш вопрос..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Icon name="Send" size={16} className="mr-2" />
            Спросить
          </Button>
        </form>

        {messages.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Icon
              name="MessageCircle"
              size={32}
              className="mx-auto mb-2 text-gray-300"
            />
            <p className="text-sm">Чем могу помочь?</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MessageBubble = ({ message }: { message: AIMessage }) => {
  const isUser = message.isUser;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
        <div
          className={`mt-1 text-xs text-gray-500 ${isUser ? "text-right" : "text-left"}`}
        >
          {message.timestamp.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
      <div
        className={`flex items-end ${isUser ? "order-1 mr-2" : "order-2 ml-2"}`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-purple-600" : "bg-gray-300"
          }`}
        >
          <Icon
            name={isUser ? "User" : "Bot"}
            size={16}
            className={isUser ? "text-white" : "text-gray-600"}
          />
        </div>
      </div>
    </div>
  );
};