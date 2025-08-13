import { useParams } from 'next/navigation';
import ResetPassword from '../../components/Reset-password';

export default function ResetPasswordPathPage() {
  const params = useParams();
  const token = params.token as string | undefined;

  return <ResetPassword token={token || null} />;
}
