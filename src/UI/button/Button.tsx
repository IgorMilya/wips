import { FC, PropsWithChildren, MouseEvent } from 'react'

interface ButtonProps extends PropsWithChildren {
  variant: 'primary' | 'secondary' | 'outline' | 'red',
  disabled?: boolean,
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void,
  type?: 'submit' | 'button',
}

const styleOfVariant = {
  primary: 'justify-center bg-primary hover:bg-gray-200 focus:ring-2 focus:ring-gray-300',
  red: 'justify-center bg-error hover:bg-red-800 focus:ring-2 focus:ring-red-600',
  secondary: `justify-center bg-secondary hover:bg-purple-900 focus:ring-2 focus:ring-purple-500`,
  outline: 'justify-start font-medium',
}


const Button: FC<ButtonProps> = ({
                                   variant,
                                   children,
                                   onClick,
                                   disabled,
                                   type,
                                 }) => {

  const colorClasses = styleOfVariant[variant]
  return (
    <button
      className={`flex gap-4 items-center w-full  p-2.5 text-white font-bold rounded-md focus:outline-none  ${colorClasses} relative`}
      onClick={onClick} disabled={disabled} type={type || 'button'}
    >
      {children}
    </button>
  )
}

export default Button