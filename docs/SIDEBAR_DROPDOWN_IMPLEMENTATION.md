# Sidebar Dropdown Implementation

## Overview
Implemented expandable dropdown menus in the sidebar that show nested game tabs when clicked.

## Changes Made

### File Modified
- `components/layout/Sidebar.tsx`

### Key Features Implemented

1. **Nested Submenu Structure**
   - Added `SubMenuItem` interface for nested items
   - Extended `MenuItem` interface with `submenuItems?: SubMenuItem[]`
   - Each category now has its own list of games

2. **Dropdown State Management**
   - Added `openDropdowns` state to track which dropdowns are open
   - Implemented `toggleDropdown()` function to handle dropdown clicks
   - Chevron icon rotates 180° when dropdown is open

3. **Category Games Added**

   **Sports:**
   - Cricket
   - Football
   - Tennis
   - Basketball
   - Horse Racing

   **Live Casino:**
   - Roulette
   - Blackjack
   - Baccarat
   - Poker
   - Dragon Tiger

   **Slots:**
   - Book of Dead
   - Starburst
   - Gonzo's Quest
   - Mega Moolah
   - Jammin' Jars

   **Crash:**
   - Aviator
   - JetX
   - Spaceman
   - Crash X

   **Table Games:**
   - European Roulette
   - American Roulette
   - Blackjack Classic
   - Video Poker

   **Fishing:**
   - Fishing God
   - Ocean King
   - Fishing War
   - Happy Fishing

   **Arcade:**
   - Plinko
   - Mines
   - Dice
   - Hilo

   **Lottery:**
   - Keno
   - Lucky Numbers
   - Mega Lottery

   **Referral:**
   - My Referrals
   - Referral Stats
   - Earnings

4. **UI/UX Enhancements**
   - Submenu items appear below parent with left border (blue #1A79D3)
   - Submenu items are indented and slightly smaller
   - Active submenu item is highlighted with blue background
   - Parent item shows active state if any child is active
   - Chevron icon animates on dropdown toggle
   - Submenu only shows when sidebar is expanded (not minimized)

5. **Button vs Link Behavior**
   - Items with submenus are now `<button>` elements to handle dropdown toggle
   - Items without submenus remain `<Link>` elements for direct navigation
   - External links (like Affiliate) still open in new tab

## How It Works

1. **Clicking a category with submenu:**
   - Triggers `toggleDropdown(item.href)` 
   - Updates `openDropdowns` state
   - Chevron rotates 180°
   - Submenu slides down with nested game links

2. **Clicking a game in submenu:**
   - Navigates to game page (e.g., `/sports/cricket`)
   - Game link is highlighted as active
   - Parent category also shows active state

3. **Minimized sidebar:**
   - Dropdowns don't expand (insufficient space)
   - Tooltip shows category name on hover
   - Can expand sidebar to see game lists

## Routing Structure

All game routes follow this pattern:
```
/[category]/[game-name]
```

Examples:
- `/sports/cricket`
- `/casino/blackjack`
- `/slots/starburst`
- `/crash/aviator`

## Next Steps (Optional)

1. Create actual game pages for each route
2. Fetch real game data from backend/API
3. Add game thumbnails/icons in submenu
4. Implement game search within categories
5. Add "All Games" link at top of each submenu
6. Persist dropdown state in localStorage
7. Add animation transitions for smoother UX

## Testing

1. Open the application
2. Click on any category with a dropdown (Sports, Casino, Slots, etc.)
3. Verify the submenu expands showing game names
4. Click a game to navigate to its page
5. Verify chevron icon rotates when dropdown toggles
6. Test minimized sidebar - dropdowns should not expand
7. Verify active states for both category and nested games
