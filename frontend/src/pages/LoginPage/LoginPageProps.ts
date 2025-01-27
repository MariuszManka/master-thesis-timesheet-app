export interface ILoginPageInputProps {
   label: string;
   inputId: string;
   placeholder: string;
   inputType: "text" | "password",

   MOCK_DEFAULT_VALUE?: string; // TODO USUNĄĆ
}