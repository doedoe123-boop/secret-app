import Hero from "@/components/hero";

export default async function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1 item-center text-center flex flex-col gap-6 px-4">
        <p className="text-gray-700 dark:text-gray-300">
          Welcome to the Secret App. This platform is designed for secure and private access.
          Only authorized users can proceed beyond this page. Please log in or sign up to continue.
        </p>

        <p className="text-gray-700 dark:text-gray-300">
          Unauthorized access is strictly prohibited. Your activity may be monitored.
        </p>
      </main>
    </>
  );
}
