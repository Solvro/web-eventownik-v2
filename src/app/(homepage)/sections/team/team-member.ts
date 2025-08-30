type role =
  | "Project Manager"
  | "Opiekun Projektu"
  | "Backend Techlead"
  | "Backend Developer"
  | "Frontend Techlead"
  | "Frontend Developer"
  | "UI/UX Designer"
  | "Devops Engineer"
  | "Marketing Coordinator";

export interface TeamMember {
  name: string;
  roles: role[];
  image?: string;
  url: string;
}
