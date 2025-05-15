import type { Preview } from "@storybook/react";
import "../app/globals.css";
import { ThemeProvider } from "../contexts/theme-provider";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen p-10">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
