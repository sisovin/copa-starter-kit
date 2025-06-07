# Enhanced Button Component

The Button component is a customizable UI element built on Radix UI's Slot pattern, using Tailwind CSS for styling, and providing several variants and features.

## Features

- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon
- **Loading State**: Shows a spinner when `isLoading` is true, with proper accessibility attributes
- **Icon Support**: Add icons to the left or right side of the button text
- **TypeScript Props**: Fully typed component props
- **Storybook Stories**: Examples of all variants and states
- **Accessibility**: Screen reader support, proper ARIA attributes, keyboard navigation

## Usage

```tsx
import { Button } from '@/components/ui/button'
import { Mail, ArrowRight } from 'lucide-react'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Mail /></Button>

// Loading state
<Button isLoading>Processing</Button>
<Button isLoading loadingText="Saving...">Save</Button>

// With icons
<Button leftIcon={<Mail />}>Email</Button>
<Button rightIcon={<ArrowRight />}>Next</Button>
<Button leftIcon={<Mail />} rightIcon={<ArrowRight />}>Send Email</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

## Props

| Prop        | Type                                                                        | Default   | Description                                                   |
| ----------- | --------------------------------------------------------------------------- | --------- | ------------------------------------------------------------- |
| variant     | 'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link' | 'default' | Style variant of the button                                   |
| size        | 'default' \| 'sm' \| 'lg' \| 'icon'                                         | 'default' | Size variant of the button                                    |
| isLoading   | boolean                                                                     | false     | When true, shows a loading spinner and disables the button    |
| loadingText | string                                                                      | undefined | Text to be announced to screen readers when button is loading |
| leftIcon    | React.ReactNode                                                             | undefined | Icon component to show on the left side of the button text    |
| rightIcon   | React.ReactNode                                                             | undefined | Icon component to show on the right side of the button text   |
| asChild     | boolean                                                                     | false     | When true, button will delegate its rendering to its child    |
| disabled    | boolean                                                                     | false     | When true, disables the button                                |

All standard HTML button attributes are also supported.

## Development

Run Storybook to see all button variants and states:

```bash
npm run storybook
```

This will start Storybook at http://localhost:6006/
