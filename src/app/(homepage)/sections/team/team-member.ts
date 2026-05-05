type role =
  | "Project Manager"
  | "Product Owner"
  | "Opiekun Projektu"
  | "Backend Techlead"
  | "Backend Developer"
  | "Frontend Techlead"
  | "Frontend Developer"
  | "UI/UX Designer"
  | "Devops Engineer"
  | "Marketing Coordinator"
  | "Contributor";

export interface TeamMember {
  name: string;
  roles: role[];
  image?: string;
  url: string;
}
