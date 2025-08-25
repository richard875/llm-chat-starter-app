import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { useMessages } from "@/store/messages";
import { Button } from "@/components/ui/button";

export const Sidebar = () => {
  const {
    chats,
    currentChatId,
    isLoadingMsg,
    isLoadingChats,
    startNewChat,
    fetchChats,
    loadChatMessages,
  } = useMessages();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return (
    <div className="w-60 border-r shadow-sm pt-5 pb-3 p-2 gap-3 flex flex-col justify-between select-none">
      <div className="h-full overflow-auto">
        {isLoadingChats ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoaderCircle className="animate-spin" />
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <div
              className={`text-primary px-2.5 py-2 rounded-md
                ${isLoadingMsg ? "" : "cursor-pointer hover:bg-accent"}
                ${currentChatId === chat.chatId ? "bg-accent" : ""}
                `}
              key={chat.chatId}
              onClick={() => !isLoadingMsg && loadChatMessages(chat.chatId)}
            >
              <p className="text-[15px] truncate" title={chat.title}>
                {chat.title}
              </p>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[15px] text-gray-500">No Chats Yet</p>
          </div>
        )}
      </div>
      <Button
        disabled={isLoadingMsg}
        onClick={startNewChat}
        variant="outline"
        size="sm"
        className="w-full py-4.5 text-[15px] text-primary rounded-md cursor-pointer border border-primary transition bg-[#a3e636] hover:bg-[#91cc33]"
      >
        New Chat
      </Button>
    </div>
  );
};
