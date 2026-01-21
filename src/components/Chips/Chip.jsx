import { cva } from 'class-variance-authority'
import React from 'react'

function Chip({ size = "small", type = "success", label = "Label", glow = true }) {

  const styles = cva(
    "rounded-md w-fit flex gap-2 items-center font-bold",
    {
      variants: {
        size: {
          large: "px-3 py-1",
          small: "px-2 py-1 | text-[0.6rem] 2xl:text-xs",
          xs: "px-2 py-1 text-[0.6rem]"
        },
        type: {
          success: "bg-[#AFEAB3] text-[#3F9200]",
          danger: "bg-[#FFBBA7] text-[#C22F02]",
          draft: "bg-[#b4daff] text-[#1976d2]",
          warning: "bg-[#FFF3CD] text-[#856404]",
          archived: "bg-[#D7CCC8] text-[#5D4037]"
        }
      },
      defaultVariants: {
        size: "small",
        type: "success",
      },
    }
  )

  const glowStyles = cva(
    "blur-sm",
    {
      variants: {
        size: {
          large: "w-3 h-3",
          small: "w-2 h-2",
          xs: "w-1 h-1",
        },
        type: {
          success: "bg-[#3F9200]",
          danger: "bg-[#C22F02]",
          draft: "bg-[#1976d2]",
          warning: "bg-[#856404]",
          archived: "bg-[#5D4037]"
        }
      },
      defaultVariants: {
        size: "small",
        type: "success"
      },
    }
  )
  return (
    <div className={styles({ size, type })}>
      {glow && <div className={glowStyles({ size, type })} />}
      <p>{label}</p>
    </div>
  )
}

export default Chip