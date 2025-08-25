# LLM Chat Starter Application

A modern chat application built with React and OpenAI integration.

## Project Structure

The project is organized as a Yarn 4 monorepo with the following structure:

```
llm-chat-starter-app/
├── apps/
│   ├── frontend/     # Vite + React + TypeScript + shadcn
│   └── backend/      # Hono backend with OpenAI integration
```

## Prerequisites

- Node.js (v18 or higher)
- Yarn (v4)
- OpenAI API key

## Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/brainfish-ai/llm-chat-starter-app.git
cd llm-chat-starter-app
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

**Backend**

```bash
# Navigate to the backend directory
cd apps/backend

# Create a .env file
cp .env.example .env

# Add your OpenAI API key to the .env file
```

**Frontend**

```bash
# Navigate to the backend directory
cd apps/backend

# Create a .env file
cp .env.example .env

# Add your OpenAI API key to the .env file
```

4. Start the development servers:

```bash
# From the root directory
yarn dev
```

This will start both the frontend (at http://localhost:5173) and the backend (at http://localhost:3000).

## Testing

The backend uses Vitest for testing. To run tests:

```bash
# Run all tests
yarn test

# Run backend tests only
yarn workspace backend test

# Run tests in watch mode
yarn workspace backend test --watch
```

Note: Frontend tests are not currently set up.

## Technologies Used

- **Frontend**: Vite, React, TypeScript, shadcn UI components
- **Backend**: Hono, Node.js, TypeScript
- **Monorepo**: Yarn 4 workspaces
- **LLM Integration**: OpenAI API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Chat ID Implementation Summary

## Overview

Added a `chatId` field to the database and application to enable chat session management. Each conversation thread now has a unique identifier, allowing users to maintain separate chat sessions.

## Database Changes

### Schema Updates

- Added `chatId` field to the `messages` table as a `varchar(255)` NOT NULL column
- Updated TypeScript types to include `chatId` in Message and NewMessage interfaces

### Migration

- Generated migration file: `drizzle/0001_fixed_union_jack.sql`
- Applied migration to add `chat_id` column to the database

## Backend Changes

### API Endpoints

1. **Modified `/api/chat` endpoint**:

   - Now accepts optional `chatId` in request body
   - Generates new `chatId` if not provided
   - Saves both user and assistant messages with the `chatId`

2. **New `/api/chat/new` endpoint**:

   - Generates and returns a new unique chat ID
   - Format: `chat_{timestamp}_{9-character-random-string}`

3. **Enhanced message endpoints**:
   - `/api/messages/:chatId` - Get messages for a specific chat
   - `/api/messages` - Get all messages (existing)
   - `DELETE /api/messages/:chatId` - Clear messages for a specific chat

### MessageService Updates

- Updated `saveMessage()` to require `chatId`
- Added `getMessagesByChatId()` method
- Added `clearChatMessages()` method

## Frontend Changes

### State Management

- Updated Zustand store to include:
  - `currentChatId` state
  - `setCurrentChatId()` action
  - `startNewChat()` action

### Components

1. **ChatInput Component**:

   - Generates new chat ID for first message in a session
   - Includes `chatId` in API requests
   - Handles chat ID generation with fallback

2. **Chat Component**:

   - Added "New Chat" button that appears when messages exist
   - Button triggers `startNewChat()` to reset the session

3. **Type Definitions**:
   - Updated `Message` interface to include optional `chatId` field

## Features

### Session Management

- **New Chat Sessions**: When user refreshes page or clicks "New Chat", a new session begins
- **Message Persistence**: All messages are saved to database with their associated chat ID
- **Session Continuity**: Messages within the same session share the same chat ID

### User Experience

- **Automatic Chat ID Generation**: Transparent to user - handled automatically
- **New Chat Button**: Easy way to start fresh conversation
- **Clean Session Separation**: Each chat thread is completely separate

## Testing

- Added tests for chat ID generation endpoint
- Added tests for chat ID handling in chat endpoint
- All existing tests continue to pass
- Test coverage includes error handling and validation

## Usage Examples

### Starting a New Chat

1. User opens application - no chat ID exists
2. User sends first message
3. System generates new chat ID automatically
4. All subsequent messages in session use same chat ID

### Multiple Sessions

1. User has conversation with chat ID `chat_1640995200000_abc123def`
2. User clicks "New Chat" or refreshes page
3. Next message generates new chat ID `chat_1640995500000_xyz789ghi`
4. Both conversations remain separate in database

### API Usage

```typescript
// Send message with existing chat ID
POST /api/chat
{
  "chatId": "chat_1640995200000_abc123def",
  "messages": [{"role": "user", "content": "Hello"}]
}

// Send message without chat ID (generates new one)
POST /api/chat
{
  "messages": [{"role": "user", "content": "Hello"}]
}

// Generate new chat ID
POST /api/chat/new
// Returns: {"chatId": "chat_1640995200000_abc123def"}
```

## Database Schema

```sql
CREATE TABLE "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "chat_id" varchar(255) NOT NULL,
  "role" varchar(20) NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

This implementation provides a robust foundation for chat session management while maintaining backward compatibility and providing a seamless user experience.
