# Product Management Assistant

A web-based tool that leverages AI to streamline product research, documentation, and roadmap planning with intelligent workflow optimization.

## Features

- **Document Management**: Create, organize, and edit product requirements documents with a customizable table view.
- **AI-Powered Column Customization**: Intelligently suggests table layouts based on your workflow and document content.
- **Drag-and-Drop Columns**: Easily reorganize table columns by dragging and dropping.
- **Direct In-Cell Editing**: Double-click any cell to edit its contents without popups or forms.
- **Smart Status Tracking**: Track document status with visual indicators.
- **Tag Management**: Add and organize documents with customizable tags.
- **AI Research Analysis**: Analyze research materials to extract key insights.
- **Roadmap Planning**: Visualize product roadmap with an interactive calendar view.

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI components
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Grok AI for intelligent features
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- PostgreSQL database

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/product-management-assistant.git
cd product-management-assistant
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/productmanagement
XAI_API_KEY=your_xai_api_key
```

4. Run database migrations
```
npm run db:push
```

5. Start the development server
```
npm run dev
```

## Usage

- Navigate to the Documents section to create and manage product requirements documents
- Use the AI Suggestions feature to optimize your table layout
- Double-click on cells to edit content
- Drag column headers to reorganize the table
- Use the Research Materials section to upload and analyze research data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.