export type ProfilePageProps = {
  onNext: () => void;
  onPrev: () => void;
  onFormChange: (newValue: any) => void;
  onError: (errorMessage: string) => void;
  onSubmited: () => void;
  formValue: any;
  error: string | null;
  onReset: () => void;
};
