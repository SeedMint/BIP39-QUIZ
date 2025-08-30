# BIPARDY - BIP-39 Word Game

A PWA implementation of a Bitcoin word game using the BIP-39 wordlist with offline-first scoring and optional global leaderboard.

## Features

- **Offline-First**: Scores are saved locally and work without internet
- **Optional Global Sharing**: Choose to share your scores publicly via GitHub
- **12/24 Word Game Modes**: Following BIP-39 mnemonic phrase standards
- **PWA Support**: Install and play offline on any device
- **Multi-language Support**: Available in 6 languages

## Scoring System

### Local Storage (Offline-First)
- All scores are automatically saved to browser localStorage
- Works completely offline after first load
- Personal best tracking for each game length
- Top 50 local scores maintained

### Global Leaderboard (Optional)
- Powered by GitHub as a database
- Players can optionally share scores publicly
- Top 21 global scores displayed
- Full Git history for analytics

## Privacy Policy

- Local scores remain on your device
- Global scores are public and stored in GitHub
- No personal information is collected beyond chosen display names
- No cookies or tracking used