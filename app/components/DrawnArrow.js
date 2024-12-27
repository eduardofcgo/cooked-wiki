import { Svg, Path } from 'react-native-svg'

import { theme } from '../style/style'

export default function HandDrawnArrow() {
  return (
    <Svg width="120px" height="120px" viewBox="-50 0 175 175" fill="none" xmlns="http://www.w3.org/2000/svg">
      <Path
          d="M20.1871 175C15.7485 172.891 13.0008 172.469 12.1553 170.992C8.98489 165.508 5.39173 160.024 3.70083 153.908C-1.37187 137.666 -0.737781 121.214 2.64402 104.762C8.35081 76.7092 21.0325 51.8201 36.8847 28.1966C38.5756 25.6655 40.0552 23.1344 41.7461 20.3924C41.7461 20.1814 41.5347 19.7596 41.112 19.1268C36.462 20.3923 31.6007 21.6579 26.9507 22.7125C24.4144 23.1344 21.4552 23.1344 18.9189 22.2907C17.4394 21.8688 15.3258 19.5486 15.3258 18.0722C15.3258 16.1739 16.8053 13.8537 18.0735 12.1663C19.1303 11.1117 21.0326 10.9008 22.7235 10.4789C35.4052 7.31508 48.087 3.72935 60.9801 0.776411C71.9709 -1.75468 75.564 1.83105 74.9299 12.5882C74.2959 23.7672 74.0845 34.9462 73.6618 45.9142C73.4505 49.289 72.8164 52.8747 72.3936 56.6714C63.5164 52.6638 63.5164 52.6638 60.346 18.494C47.0301 33.2588 38.1529 49.289 29.9098 65.7411C21.6666 82.1932 16.1712 99.489 13.2121 117.839C10.2531 136.823 13.8462 154.751 20.1871 175Z" 
          fill={theme.colors.primary} />
    </Svg>
  )
}
