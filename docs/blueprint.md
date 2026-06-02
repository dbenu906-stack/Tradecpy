# **App Name**: PulseCopy

## Core Features:

- Centralized Signal API: An HTTPS endpoint designed for the Master EA to report real-time trade signals and status changes to the database.
- Smart Multiplier Tool: AI-powered tool that analyzes a follower's historical balance and master volatility to suggest optimal risk-managed lot multipliers.
- Unified Connection Portal: User interface for registering Master and Follower MT5 accounts, ensuring secure token management and connectivity status.
- Signal Distribution Engine: Real-time orchestration system that polls trades from the Master and pushes actionable commands to all registered Follower EAs.
- Live Performance Matrix: Interactive dashboard showcasing live open positions, historical win rates, and account-specific drawdown analytics.
- Dynamic Risk Safeguards: Hard-coded rules engine allowing followers to set maximum drawdown thresholds and manual emergency disconnection triggers.
- Trade Registry Store: A persistent MySQL-backed transaction log for auditing performance across both master and multiple follower account hierarchies.

## Style Guidelines:

- A sophisticated dark mode palette reflecting high-speed financial environments. Primary color: Electric Blue (#0D73F3) to symbolize rapid signal transmission. Background color: Deep Obsidian (#14191F) for professional, high-contrast visual focus.
- Accent color: Celestial Cyan (#48DBFB) used for highlight indicators and status updates, providing an analogous transition from the primary blue.
- Font pairing: 'Space Grotesk' for headers and data labels to give a modern, tech-forward aesthetic, paired with 'Inter' for numerical body data to ensure maximum readability.
- Monospaced font: 'Source Code Pro' used for API keys and connection logs to prevent reading errors during configuration.
- High-density dashboard layout featuring a modular grid system, allowing for multiple monitoring panes without overwhelming the user.
- Sharp, minimalist stroke icons with status-indicated colors (Active/Pending/Error) to provide quick visual diagnostics of EA connectivity.
- Low-latency micro-interactions such as 'pulse' effects on active signal bridges to indicate data throughput without distracting from trade data.