import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput'
import CustomSubmit from '@components/form/CustomSubmit'
import useAlert from '@hooks/useAlert'
import userStore from '@stores/UserStore'
import { Form } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {

  const initialValues = { email: "", password: "" }
  const { login, loading } = userStore()
  const { success, error } = useAlert()
  const nav = useNavigate()
  const [form] = Form.useForm();

  const onSubmit = async (values) => {
    try {
      await login(values)
      nav('/')
      success("Successfully logged in")
      console.log("Received values of form: ", values);
    } catch (err) {
      console.log("Error logging in: ", err.message);
    }
  };

  return (
    <div className='bg-login w-full h-screen bg-cover bg-center p-10 flex items-center justify-center'>
      <div className='flex justify-center items-center bg-white rounded-3xl w-full | lg:h-full'>

        <div className='flex flex-col justify-center items-center | w-full p-8 lg:px-10 lg:w-1/2'>
          <div className='space-y-5 | w-full lg:w-3/4'>
            <img src="/images/logo.png" alt="" className='w-full mdw-1/2 pb-10' />

            <div>
              <h1 className='text-3xl font-black'>Welcome back</h1>
              <p className='text-gray-500 mt-2'>Please login to continue your journey!</p>
            </div>
            <div>
              <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
                <CustomInput label={"Email"} name={"email"} placeholder={"john@doe.com"} className='px-3 py-2 | w-full lg:w-3/4 ' />
                <CustomInput label={"Password"} name={"password"} placeholder={"Password"} type='password' className='px-3 py-2 | w-full lg:w-3/4' />
                <CustomSubmit className='bg-primary' label='Login' loading={loading} />
              </CustomForm>
            </div>
          </div>
        </div>

        <div className='w-1/2 h-full relative max-lg:hidden'>
          <div className='inset-3 absolute bg-login rounded-3xl flex items-end overflow-hidden'>
            <div className='w-full h-full bg-gradient-to-t from-[#4f651e] to-transparent transition-opacity duration-3000 relative z-10 flex justify-end flex-col p-10 '>
              <h1 className='text-white font-bold text-4xl'>Give Wings To Your Dreams</h1>
              <p className='text-white font-bold mt-2'>Join Us Now</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login