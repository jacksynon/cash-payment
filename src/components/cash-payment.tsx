import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const denominations = [
  { name: "hundred", value: 100 },
  { name: "fifty", value: 50 },
  { name: "twenty", value: 20 },
  { name: "ten", value: 10 },
  { name: "five", value: 5 },
  { name: "2dollars", value: 2 },
  { name: "1dollar", value: 1 },
  { name: "50cents", value: 0.5 },
  { name: "20cents", value: 0.2 },
  { name: "10cents", value: 0.1 },
  { name: "5cents", value: 0.05 },
];

interface PaymentChange {
  name: string;
  amount: number;
}

const workOutChange = (price: number, amountGiven: PaymentChange[]) => {
  const denominationMap = new Map(
    denominations.map((value) => [value.name, value.value])
  );

  const amountGivenNumber = amountGiven.reduce((acc, currentValue) => {
    const currencyValue = denominationMap.get(currentValue.name);

    if (!currencyValue) {
      console.log("Currency not found in denominations list");
      return acc;
    }

    return acc + currencyValue * currentValue.amount;
  }, 0);

  if (amountGivenNumber < price) {
    return {
      success: false,
      message: "The amount given is less than the price",
    };
  }

  if (amountGivenNumber === price) {
    return {
      success: true,
      message: "Correct amount given",
    };
  }

  let difference = amountGivenNumber - price;
  difference = Math.round(difference * 100) / 100;

  const change = [] as PaymentChange[];

  denominations.forEach((denomination) => {
    if (difference >= denomination.value) {
      const amountOfNotes = Math.floor(difference / denomination.value);
      if (amountOfNotes > 0) {
        change.push({
          name: denomination.name,
          amount: amountOfNotes,
        });
        difference = difference - denomination.value * amountOfNotes;
        difference = Math.round(difference * 100) / 100;
      }
    }
  });

  return change;
};

const formatDenominationName = (name: string) => {
  switch (name) {
    case "2dollars":
      return "$2";
    case "1dollar":
      return "$1";
    case "50cents":
      return "50c";
    case "20cents":
      return "20c";
    case "10cents":
      return "10c";
    case "5cents":
      return "5c";
    case "hundred":
      return "$100";
    case "fifty":
      return "$50";
    case "twenty":
      return "$20";
    case "ten":
      return "$10";
    case "five":
      return "$5";
    default:
      return name;
  }
};

export default function Component() {
  const [counts, setCounts] = useState(
    denominations.reduce((acc, denom) => {
      acc[denom.name] = 0;
      return acc;
    }, {} as Record<string, number>)
  );

  const [purchaseAmount, setPurchaseAmount] = useState(100);

  const handleIncrement = (name: string) => {
    setCounts((prev) => ({ ...prev, [name]: prev[name] + 1 }));
  };

  const handleDecrement = (name: string) => {
    setCounts((prev) => ({ ...prev, [name]: Math.max(0, prev[name] - 1) }));
  };

  const totalPaid = Object.entries(counts).reduce((acc, [name, amount]) => {
    let total = acc;
    denominations.forEach((denom) => {
      if (denom.name === name) {
        total = total + denom.value * amount;
      }
    });
    return total;
  }, 0);

  const change = workOutChange(
    purchaseAmount,
    Object.entries(counts).map(([name, amount]) => ({ name, amount }))
  );

  const isChangeArray = Array.isArray(change);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Change Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold p-4">
          Purchase Amount: $
          <input
            type="number"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(Number(e.target.value))}
            className="ml-2 w-24 text-center p-2 border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {denominations.map((denom) => (
            <div
              key={denom.name}
              className="flex flex-col items-center p-2 border rounded-lg"
            >
              <span className="text-lg font-semibold mb-2">
                {formatDenominationName(denom.name)}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDecrement(denom.name)}
                  disabled={counts[denom.name] === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-8 text-center">
                  {counts[denom.name]}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleIncrement(denom.name)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <div className="text-xl font-bold">
          Total Paid: ${totalPaid.toFixed(2)}
        </div>
        {isChangeArray ? (
          <div className="text-2xl font-bold">
            Change Due:
            <div className="flex flex-col items-center">
              {change.map((item, index) => (
                <div className="flex items-center" key={index}>
                  {item.amount} x {formatDenominationName(item.name)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-2xl font-bold text-green-600">
            {change.message}
          </div>
        )}

        {
          <Button
            onClick={() => {
              setCounts(
                denominations.reduce((acc, denom) => {
                  acc[denom.name] = 0;
                  return acc;
                }, {} as Record<string, number>)
              );
              setPurchaseAmount(0);
            }}
          >
            Clear
          </Button>
        }
      </CardFooter>
    </Card>
  );
}
