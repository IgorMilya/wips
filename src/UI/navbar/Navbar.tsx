import { FC } from 'react'
import { LinkItemType } from 'types'
import { NavItem } from './nav-item'

interface NavbarProps {
  data: LinkItemType[]
}

const Navbar: FC<NavbarProps> = ({ data }) => {

  return (
    <nav className="bg-secondary h-screen w-[20%] ">
      {data.map((item) => (
        <NavItem
          key={item.link}
          data={item}
        />
      ))}
    </nav>
  )
}

export default Navbar
