import { grommet } from "grommet";
import { deepMerge } from "grommet/utils";

const customTheme = deepMerge(grommet, {
  global: {
    colors: {
      brand: "#deb536",
      "accent-1": "#7D4CDB"
    }
  }
});

export default customTheme;
