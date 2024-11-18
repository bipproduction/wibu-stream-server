// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import { EnvClientProvider } from "@/lib/client/EnvClient";
import { EnvServer } from "@/lib/server/EnvServer";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { WibuContainer } from "@/lib/client/WibuContainer";

export const metadata = {
  title: "My Mantine app",
  description: "I have followed setup instructions carefully"
};

const env = JSON.stringify(process.env);
EnvServer.init(process.env);

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <WibuContainer />
        <EnvClientProvider env={env} />
        <MantineProvider defaultColorScheme="dark">{children}</MantineProvider>
      </body>
    </html>
  );
}
// wibu:1.0.58
