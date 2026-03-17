export type PotTypeForSeeds = {
  name: string;
  priority: number;
  potCategory: string;
  slug: string;
  mccp: [
    {
      code: string;
      description: string;
      priority: number;
    },
  ];
};
