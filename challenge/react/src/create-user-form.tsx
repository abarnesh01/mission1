import { useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

const API_BASE_URL = 'https://api.challenge.hennge.com/password-validation-challenge-api/001';

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState('');

  const passwordCriteria = [
    { id: 'min-length', label: 'Password must be at least 10 characters long', isValid: (p: string) => p.length >= 10 },
    { id: 'max-length', label: 'Password must be at most 24 characters long', isValid: (p: string) => p.length <= 24 },
    { id: 'no-spaces', label: 'Password cannot contain spaces', isValid: (p: string) => !p.includes(' ') },
    { id: 'one-number', label: 'Password must contain at least one number', isValid: (p: string) => /\d/.test(p) },
    { id: 'one-uppercase', label: 'Password must contain at least one uppercase letter', isValid: (p: string) => /[A-Z]/.test(p) },
    { id: 'one-lowercase', label: 'Password must contain at least one lowercase letter', isValid: (p: string) => /[a-z]/.test(p) },
  ];

  const failingCriteria = passwordCriteria.filter((c) => !c.isValid(password));
  const isPasswordValid = password !== '' && failingCriteria.length === 0;
  const isUsernameValid = username.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!isUsernameValid || !isPasswordValid) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/challenge-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: The token should be obtained from the path parameter of the /challenge-details page.
          // Since it's not provided in the workspace, I've left it as a placeholder or handled as needed.
          // In a real environment, this might be injected or retrieved from the URL.
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setUserWasCreated(true);
      } else {
        if (response.status === 401 || response.status === 403) {
          setApiError('Not authenticated to access this resource.');
        } else if (response.status === 500) {
          setApiError('Something went wrong, please try again.');
        } else {
          const data = await response.json();
          if (data.errors?.includes('not_allowed')) {
            setApiError('Sorry, the entered password is not allowed, please try a different one.');
          } else {
            setApiError('Something went wrong, please try again.');
          }
        }
      }
    } catch (error) {
      setApiError('Something went wrong, please try again.');
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        <label htmlFor="username" style={formLabel}>
          Username
        </label>
        <input
          id="username"
          style={formInput}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-invalid={!isUsernameValid && username !== ''}
        />

        <label htmlFor="password" style={formLabel}>
          Password
        </label>
        <input
          id="password"
          type="password"
          style={formInput}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={failingCriteria.length > 0 && password !== ''}
        />

        {password !== '' && failingCriteria.length > 0 && (
          <ul style={errorList}>
            {failingCriteria.map((criterion) => (
              <li key={criterion.id}>{criterion.label}</li>
            ))}
          </ul>
        )}

        {apiError && <p style={apiErrorMessage}>{apiError}</p>}

        <button style={formButton} type="submit">
          Create User
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

const errorList: CSSProperties = {
  margin: '8px 0',
  paddingLeft: '20px',
  color: '#d32f2f',
  fontSize: '14px',
};

const apiErrorMessage: CSSProperties = {
  color: '#d32f2f',
  fontSize: '14px',
  margin: '8px 0',
  fontWeight: 500,
};
