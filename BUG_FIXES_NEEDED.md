# Bug Fixes Needed - Ad Astra

## 1. ✅ Top Navigation Button Active State
**Problem**: Navigation buttons don't highlight to show which view is active
**Solution**: Add/remove 'active' class when switching views

## 2. ✅ Stats View Empty
**Problem**: Stats button shows nothing
**Solution**: Stats view exists but needs proper initialization

## 3. ✅ Trade View Empty  
**Problem**: Trade button shows nothing
**Solution**: Trade view needs to be populated when clicked

## 4. ✅ Warp Animation Missing
**Problem**: Hyperdrive videos (hyperdrive1-4.webm) not showing during warp
**Files Found**: 
- assets/videos/hyperdrive1.webm
- assets/videos/hyperdrive2.webm
- assets/videos/hyperdrive3.webm
- assets/videos/hyperdrive4.webm
**Solution**: Show random hyperdrive video during warp travel overlay

## 5. ✅ Music Playlist Not Randomizing
**Problem**: Same song loops instead of playing through randomized playlist
**Current State**: 
- Music discovery works
- Playlist mode exists
- But playlist isn't being used/randomized properly
**Solution**: 
- Enable playlist mode by default
- Shuffle playlist on init
- Ensure next track plays after current ends

## 6. ✅ Settings Menu Missing
**Problem**: No UI for music/audio settings
**Needed Features**:
- Checkbox list of music tracks to enable/disable
- Mute all music toggle
- Volume sliders
- Save preferences
**Solution**: Add Settings view with audio controls

---

## Implementation Priority:
1. Navigation button active states (quick CSS fix)
2. Warp animation (enhance travel overlay)
3. Stats/Trade views (populate data)
4. Music playlist randomization (audio system tweak)
5. Settings menu (new view + UI)
