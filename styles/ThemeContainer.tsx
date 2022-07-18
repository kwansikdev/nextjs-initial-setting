import React from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./global-style";
import { theme } from "./theme";

interface ThemeContainerProps {
  children: React.ReactNode;
}

export function ThemeContainer({ children }: ThemeContainerProps): JSX.Element {
  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </>
  );
}
