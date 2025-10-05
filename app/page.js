import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>hello</h1>
      <Link href={'/dashboard'}>
      <Button>Hi</Button>
      </Link>
      <UserButton/>
    </div>
  );
}
