import React, { FC } from "react";
import { Box, TextInput, Button } from "grommet";
import { Copy } from "grommet-icons";

const ShortUrlDisplay: FC<{ url: string }> = ({ url }) => {
  const onCopy = () => {
    navigator.permissions.query({ name: "clipboard-write" as "clipboard" }).then(result => {
      if (result.state === "granted" || result.state === "prompt") {
        if (url) {
          navigator.clipboard.writeText(url).then(() => alert("Copied!"));
        }
      }
    });
  };
  return (
    <Box direction="row" margin={{ top: "medium" }} align="center" gap="small">
      <Box width="250px">
        <TextInput size="small" value={url} />
      </Box>
      <Button plain icon={<Copy />} onClick={onCopy} />
    </Box>
  );
};

export default ShortUrlDisplay;
