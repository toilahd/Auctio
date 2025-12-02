import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";

const ItemCard = ({
  title = "Item Self Title",
  description = "This is a brief description of the item.",
  details = "Additional details about the item can be placed here.",
}: {
  title?: string;
  description?: string;
  details?: string;
}) => {
  return (
    <Card>
      <CardHeader className="p-0 py-0">
        <img src="https://placehold.co/600x400" alt={title} className="w-lg"/>
        <CardTitle className="px-6">{title}</CardTitle>
        <CardDescription className="px-6">{description}</CardDescription>
      </CardHeader>
      <CardContent className="w-[20rem]">
        <div className="flex justify-between">
          <p className="text-muted-foreground text-sm">Giá khởi điểm:</p>
          <p className="max-w-6 text-ellipsis truncate">{details}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-muted-foreground text-sm">Tiền đặt trước:</p>
          <p className="max-w-6 text-ellipsis truncate">{details}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-muted-foreground text-sm">Thời gian tổ chức:</p>
          <p className="max-w-6 text-ellipsis truncate">{details}</p>
        </div>
      </CardContent>
      <CardFooter>
        <CardAction>
          <Button variant="ghost">View Item</Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
