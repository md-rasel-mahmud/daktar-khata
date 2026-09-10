import "rc-slider/assets/index.css"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { type FC } from "react"
import Slider from "rc-slider"

type Props = {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min?: number
  max?: number
}

// Helper function to filter out invalid props for div
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterHandleProps = (props: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { prefixCls, dragging, offset, value, index, ref, ...rest } = props
  return rest
}

const TwoWaySlider: FC<Props> = ({
  value,
  onChange,
  min = 0,
  max = 100000,
}) => {
  return (
    <TooltipProvider>
      <Slider
        range
        min={min}
        max={max}
        value={value}
        onChange={(val) => {
          if (Array.isArray(val) && val.length === 2) {
            onChange([val[0], val[1]])
          }
        }}
        handleRender={(node, handleProps) => {
          const currentVal = value[handleProps.index]
          const safeHandleProps = filterHandleProps(handleProps)

          return (
            <Tooltip>
              {/* @ts-expect-error Base UI TooltipTrigger doesn't support asChild */}
              <TooltipTrigger asChild>
                <div {...safeHandleProps}>{node}</div>
              </TooltipTrigger>

              <TooltipContent side="top">
                <span className="text-sm font-medium text-primary">
                  ৳{currentVal}
                </span>
              </TooltipContent>
            </Tooltip>
          )
        }}
        styles={{
          rail: { backgroundColor: "#d1d5db", height: 6 },
          track: { backgroundColor: "#4A7C59", height: 6 },
          handle: {
            backgroundColor: "#ffffff",
            borderColor: "#4A7C59",
            height: 18,
            width: 18,
            marginTop: -6,
          },
        }}
      />
    </TooltipProvider>
  )
}

export default TwoWaySlider
