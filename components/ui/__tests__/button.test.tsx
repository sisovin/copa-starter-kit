import { render, screen } from "@testing-library/react";
import { Mail } from "lucide-react";
import { Button } from "../button";

describe("Button component", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /Click me/i });
    expect(button).toBeInTheDocument();
  });

  it("renders correctly with different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-primary");
  });

  it("renders correctly with different sizes", () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9");

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-8");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10");

    rerender(
      <Button size="icon">
        <Mail aria-hidden="true" />
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("size-9");
  });

  it("renders loading state correctly", () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button").querySelector("svg")).toBeInTheDocument();
  });

  it("renders with left icon correctly", () => {
    render(<Button leftIcon={<Mail data-testid="left-icon" />}>Email</Button>);
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders with right icon correctly", () => {
    render(
      <Button rightIcon={<Mail data-testid="right-icon" />}>Email</Button>
    );
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders in disabled state correctly", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
