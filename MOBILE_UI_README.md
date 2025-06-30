# Bridgit AI Mobile UI Implementation

## Overview

This document provides an overview of the mobile UI implementation for the Bridgit AI translation application. The mobile UI features a central button that opens a menu with various options for the user.

## Components

### MobileMenu Component

The `MobileMenu` component is the main component for the mobile UI. It includes:

- A central button with the Bridgit AI logo that opens a menu when clicked
- A menu with options for selecting speakers, language swapping, and other actions
- Status indicators for recording and processing states

### BridgitButton Component

The `BridgitButton` component is a reusable button component that provides consistent styling across the application. It supports different variants and sizes.

## Features

- **Responsive Design**: The UI automatically adapts to mobile screen sizes
- **Speaker Selection**: Users can select between two speakers with different languages
- **Language Swapping**: Users can swap languages between speakers
- **Status Indicators**: Visual feedback for recording and processing states
- **Animated Transitions**: Smooth animations for menu opening/closing

## Usage

The mobile UI is automatically enabled when the screen width is less than 768px. The desktop UI is shown for larger screen sizes.

## Styling

The UI uses a combination of Tailwind CSS classes and custom CSS for styling. The color scheme matches the existing application design with gradients and rounded corners.

## Future Enhancements

- Add support for dark mode
- Implement gesture controls for common actions
- Add haptic feedback for button presses
- Optimize performance for low-end devices