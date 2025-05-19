import React, { FC } from 'react'
import { LinkItemType } from 'types'
import { NavLink, useLocation } from 'react-router-dom'

interface NavbarProps {
  data: LinkItemType
}

const NavItem: FC<NavbarProps> = ({ data }) => {
  const { icon, title, link } = data
  const { pathname } = useLocation()


  const isActive = pathname === link

  return (
    <NavLink
      to={link}
      className={`block text-[14px] p-[15px] font-medium transition  ${
          isActive
            ? 'bg-[rgba(255,255,255,0.1)] text-white border-l-[4px] border-[#3e3caa]'
            : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)] hover:text-white'
        }`
      }>
      {!!icon && <span className="mr-2">{icon}</span>}
      {title}
    </NavLink>
  )
}

export default NavItem
