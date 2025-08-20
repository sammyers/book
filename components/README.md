# Components

This directory contains reusable UI components for the application.

## LocationSelector

A reusable component that allows users to select a location from a list or create a new one. Similar to `TeamSelector` but designed for location data.

### Features

- **Search and Select**: Autocomplete dropdown for selecting existing locations
- **Create New**: Optional functionality to create new locations on-the-fly
- **Form Integration**: Built-in React Hook Form integration with `useController`
- **Responsive Design**: Adapts to different screen sizes
- **Customizable**: Configurable fields and styling options

### Props

```typescript
interface LocationSelectorProps<T extends FieldValues> {
  locations: Location[]; // Array of available locations
  control: Control<T>; // React Hook Form control
  name: Path<T>; // Form field name
  label: string; // Label for the selector
  onCreateLocation?: (locationData: {
    // Optional: function to create new location
    name: string;
    city: string;
    state?: string;
    address?: string;
  }) => Promise<Key | null>;
  showAddress?: boolean; // Whether to show address field (default: false)
}
```

### Basic Usage

```tsx
import { useForm } from "react-hook-form";

import { LocationSelector } from "@/components/LocationSelector";

function MyForm() {
  const { control } = useForm();

  return (
    <LocationSelector
      locations={availableLocations}
      control={control}
      name="locationId"
      label="Select Location"
    />
  );
}
```

### With Create Functionality

```tsx
function MyFormWithCreate() {
  const { control } = useForm();

  const handleCreateLocation = async locationData => {
    // Make API call to create location
    const newLocation = await createLocation(locationData);
    return newLocation.id;
  };

  return (
    <LocationSelector
      locations={availableLocations}
      control={control}
      name="locationId"
      label="Select Location"
      onCreateLocation={handleCreateLocation}
      showAddress={true}
    />
  );
}
```

### Location Data Structure

The component expects locations to have this structure:

```typescript
interface Location {
  id: string;
  name: string;
  city: string;
  state?: string;
  address?: string;
}
```

### Styling

The component uses HeroUI components and Tailwind CSS classes. It's designed to be responsive and follows the existing design system.

### Form Integration

The component automatically integrates with React Hook Form using `useController`. It handles:

- Field value management
- Validation errors
- Form submission
- Field focus and blur events

### Accessibility

- Proper labeling and ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- Form validation integration

### Examples

See `LocationSelector.example.tsx` for complete usage examples including:

- Basic usage
- With create functionality
- Custom styling
- Different field configurations
