# Forum Implementation

This forum implementation provides a Reddit-like interface for community discussions with the following features:

## Features

### 📝 Forum List Page
- **Pagination**: Custom pagination component for navigating through posts
- **Filtering**: Filter posts by category and search by title
- **Sorting**: Sort posts by Latest, Popular (based on vote score), or Trending (based on last activity)
- **Reddit-like UI**: Clean, modern interface inspired by Reddit's design

### 🗳️ Voting System
- **Upvote/Downvote**: Users can upvote or downvote forum posts
- **Real-time Updates**: Optimistic UI updates for immediate feedback
- **Authentication Required**: Only logged-in users can vote
- **Vote Persistence**: User votes are saved and displayed consistently

### 🏷️ Categories
- **Color-coded Categories**: Each category has its own color for visual organization
- **Category Filtering**: Filter posts by specific categories
- **Post Counts**: Display number of posts in each category

### 🔍 Search & Filters
- **Search Functionality**: Search posts by title
- **Active Filter Display**: Show currently active filters with ability to remove them
- **Clear All Filters**: Quickly reset all filters

## Database Schema

The forum uses the following database tables:
- `forum_categories` - Forum categories with color coding
- `forum_posts` - Forum posts with voting counts and metadata
- `forum_post_votes` - Individual user votes on posts
- `forum_comments` - Comments on posts (structure ready for future implementation)
- `forum_comment_votes` - Votes on comments (structure ready for future implementation)

## Components

### `ForumFilters`
- Handles search, sorting, and category filtering
- Manages URL query parameters for bookmarkable URLs
- Displays active filters with removal options

### `ForumPostCard`
- Displays individual forum posts in a card layout
- Handles voting functionality with optimistic updates
- Shows post metadata (author, category, comment count, timestamps)
- Reddit-inspired design with voting arrows on the left

### `CustomPagination`
- Reusable pagination component (shared with events page)
- Handles page navigation without full page reloads
- Displays page numbers with ellipsis for large page counts

## Server Actions

### `getForumPosts`
- Fetches paginated forum posts with filtering and sorting
- Includes user vote status for logged-in users
- Optimized database queries with joins

### `getForumCategories`
- Fetches all active categories with post counts
- Used for category filtering dropdown

### `voteOnPost`
- Handles upvote/downvote functionality
- Uses database transactions for consistency
- Updates post vote counts atomically

## API Routes

The forum uses Next.js Server Actions instead of API routes for better performance and type safety.

## Future Enhancements

- Forum post creation and editing
- Comment system with nested replies
- User reputation system
- Moderation tools
- Rich text editor for posts
- File attachments
- Notification system

## Usage

Navigate to `/forum` to access the forum list page. Users can:
1. Browse posts with pagination
2. Filter by category or search by title
3. Sort posts by different criteria
4. Vote on posts (requires authentication)
5. Click on posts to view details (future implementation)

The interface is fully responsive and works on all device sizes.
