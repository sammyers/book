import { Switch } from "@heroui/switch";

import { useFieldingConfiguration, useLineupViewContext } from "./context";

export function FieldingConfigurationSelector() {
  const { numInfielders, numOutfielders } = useFieldingConfiguration();
  const { changeFieldingConfiguration } = useLineupViewContext();

  return (
    <div className="flex items-center justify-around">
      <Switch
        color="default"
        isSelected={numInfielders === 5}
        onValueChange={value => changeFieldingConfiguration({ numInfielders: value ? 5 : 4 })}
        startContent={<span>4</span>}
        endContent={<span>5</span>}
        thumbIcon={({ isSelected, className }) => (
          <span className={className}>{isSelected ? "5" : "4"}</span>
        )}
      >
        Infielders
      </Switch>
      <Switch
        color="default"
        isDisabled={numInfielders === 5}
        isSelected={numOutfielders === 4}
        onValueChange={value => changeFieldingConfiguration({ numOutfielders: value ? 4 : 3 })}
        startContent={<span>3</span>}
        endContent={<span>4</span>}
        thumbIcon={({ isSelected, className }) => (
          <span className={className}>{isSelected ? "4" : "3"}</span>
        )}
      >
        Outfielders
      </Switch>
    </div>
  );
}
