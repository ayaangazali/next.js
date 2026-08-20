import image from './image'
import Image from 'next/image'
import Component from './component'
import PlatformComponent from './PlatformComponent'
import { platformLabel } from 'platform-pkg'

export default function Page() {
  return (
    <p>
      <Image src={image} alt="hello image 1" />
      <Component />
      <PlatformComponent />
      <span>{platformLabel}</span>
    </p>
  )
}
