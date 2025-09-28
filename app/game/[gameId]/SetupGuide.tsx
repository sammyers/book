import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/react";
import { BaseballIcon } from "@phosphor-icons/react";

// interface Props {
//   currentTab: string;
// }

export function SetupGuide() {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
      <Card classNames={{ base: "bg-content2", body: "p-2" }} shadow="sm">
        <CardBody>
          <Button
            size="lg"
            color="primary"
            // variant="flat"
            startContent={<BaseballIcon size={24} weight="duotone" />}
          >
            Start Game
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
