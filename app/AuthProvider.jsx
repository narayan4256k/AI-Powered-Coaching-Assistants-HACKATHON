
import { api } from '@/convex/_generated/api';
import { useUser } from '@stackframe/stack'
import { useMutation } from 'convex/react';
import React, { useEffect, Suspense } from 'react'

function AuthContent({ children }) {
  const user = useUser();

  useEffect(() => {
    console.log(user)
  }, [user])

  const createUser = useMutation(api.users.CreateUser);

  const CreateNewUser = async()=>{
    const result=await createUser(
        {
            name: user?.displayName,
           email: user.primaryEmail
        }
    )
  }

  return <>{children}</>
}

export default function AuthProvider({ children }) {
  return (
    <Suspense fallback={<p>Loading user...</p>}>
      <AuthContent>{children}</AuthContent>
    </Suspense>
  )
}
