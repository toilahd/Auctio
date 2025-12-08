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

class Currency {
  symbol: string;
  price: number;

  constructor(symbol: string, price: number);
  constructor(price: number);

  constructor(symbolOrPrice: string | number, price?: number) {
    if (typeof symbolOrPrice === "number" && price === undefined) {
      this.price = symbolOrPrice;
      this.symbol = "đ";
    } else if (typeof symbolOrPrice === "string" && typeof price === "number") {
      this.price = price;
      this.symbol = symbolOrPrice;
    } else {
      throw new Error("Invalid constructor arguments");
    }
  }
}

const ItemCard = ({
  imgUrl = "https://placehold.co/600x400",
  title = "Item Self Title",
  description = "This is a brief description of the item.",
  details = "Adhihihi",
  startPrice,
  depositPrice,
  startTime,
}: {
  imgUrl?: string;
  title?: string;
  description?: string;
  startPrice?: Currency;
  depositPrice?: Currency;
  startTime?: string;
  details?: string;
}) => {
  return (
    <Card className="w-full max-w-[20rem] shrink-0 gap-4">
      <CardHeader className="p-0 py-0">
        <img
          src={imgUrl}
          alt={title}
          className="w-full h-[212px] object-cover"
        />
        <CardTitle className="px-6">{title}</CardTitle>
        <CardDescription className="px-6 mb-0 ">{description}</CardDescription>
      </CardHeader>
      <CardContent className=" p-0 m-0">
        {startPrice && (
          <div className="flex justify-between w-full px-6">
            <p className="text-muted-foreground text-sm">Giá khởi điểm:</p>
            <p className="max-[50ch] text-ellipsis truncate">
              {startPrice?.price}
              {startPrice?.symbol}
            </p>
          </div>
        )}
        {depositPrice && (
          <div className="flex justify-between w-full px-6">
            <p className="text-muted-foreground text-sm">Tiền đặt trước:</p>
            <p className="max-[50ch] text-ellipsis truncate">
              {depositPrice?.price}
              {depositPrice?.symbol}
            </p>
          </div>
        )}
        {startTime && (
          <div className="flex justify-between w-full px-6">
            <p className="text-muted-foreground text-sm">Thời gian tổ chức:</p>
            <p className="max-[50ch] text-ellipsis truncate">{details}</p>
          </div>
        )}
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
