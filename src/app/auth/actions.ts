"use server";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  console.warn(email, password);
  const data = await fetch(
    "https://api.eventownik.solvro.pl/api/v1/auth/register",
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
      }),
    },
  ).then(async (response) => {
    if (response.status === 200) {
      return response.json() as Promise<{
        admin: {
          id: number;
          firstName: string;
          lastName: string;
          email: string;
          active: boolean;
          createdAt: string;
          updatedAt: string;
        };
        token: string;
      } | null>;
    }
    if (response.status === 422) {
      return response.json() as Promise<{
        errors: [
          {
            message: string;
            field: string;
          },
        ];
      }>;
    }
  });
  console.warn(data);
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.warn(email, password);
  const data = await fetch(
    "https://api.eventownik.solvro.pl/api/v1/auth/login",
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        rememberMe: true,
      }),
    },
  ).then(async (response) => {
    if (response.status === 200) {
      return response.json() as Promise<{
        admin: {
          id: number;
          firstName: string;
          lastName: string;
          email: string;
          active: boolean;
          createdAt: string;
          updatedAt: string;
        };
        token: string;
      } | null>;
    }
    if (response.status === 422) {
      return response.json() as Promise<{
        errors: [
          {
            message: string;
            field: string;
          },
        ];
      }>;
    }
  });
  console.warn(data);
}
