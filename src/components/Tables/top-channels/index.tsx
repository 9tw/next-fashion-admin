import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { compactFormat, standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getTopProducts } from "../fetch";
import { TrashIcon } from "@/assets/icons";
import { DownloadIcon, PreviewIcon } from "../icons";

export async function TopChannels({ className }: { className?: string }) {
  const data = await getTopProducts();

  return (
    <div
      className={cn(
        "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      {/* <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Top Channels
      </h2> */}

      <Table>
        <TableHeader>
          <TableRow className="uppercase [&>th]:text-center">
            <TableHead className="min-w-[120px] !text-left">
              Product Name
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((product: any, i: any) => (
            <TableRow
              className="text-center text-base font-medium text-dark dark:text-white"
              key={product.name + i}
            >
              <TableCell className="flex min-w-fit items-center gap-3">
                {/* <Image
                  src={channel.logo}
                  className="size-8 rounded-full object-cover"
                  width={40}
                  height={40}
                  alt={channel.name + " Logo"}
                  role="presentation"
                /> */}
                <Image
                  src={product.image}
                  className="aspect-[6/5] w-15 rounded-[5px] object-cover"
                  width={60}
                  height={50}
                  alt={"Image for product " + product.name}
                  role="presentation"
                />
                <div className="">{product.name}</div>
              </TableCell>

              <TableCell>{product.category}</TableCell>

              <TableCell>${product.price}</TableCell>

              <TableCell>{product.sold}</TableCell>

              <TableCell>${product.profit}</TableCell>

              {/* 
              <TableCell>{compactFormat(channel.visitors)}</TableCell>

              <TableCell className="!text-right text-green-light-1">
                ${standardFormat(channel.revenues)}
              </TableCell>

              <TableCell>{channel.sales}</TableCell>

              <TableCell>{channel.conversion}%</TableCell> */}

              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-center gap-x-3.5">
                  <button className="hover:text-primary">
                    <span className="sr-only">View Invoice</span>
                    <PreviewIcon />
                  </button>

                  <button className="hover:text-primary">
                    <span className="sr-only">Delete Invoice</span>
                    <TrashIcon />
                  </button>

                  {/* <button className="hover:text-primary">
                    <span className="sr-only">Download Invoice</span>
                    <DownloadIcon />
                  </button> */}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
