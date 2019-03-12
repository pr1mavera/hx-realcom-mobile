<template>
    <div class="water-mark" ref="bg">
        <canvas class="water-mark-canvas" ref="canvas"></canvas>
    </div>
</template>

<script>
export default {
    props: {
        img: {
            type: String
        },
        angle: {
            type: Number,
            'default': -20
        },
        space: {
            type: Number,
            'default': 190
        }
    },
    data() {
        return {
            canvas: null,
            offset_x: 40,
            offset_y: 40,
            pos: []
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (!this.img) {
                return console.warn('WARN in water-mark: please set the img option')
            }
            // 初始化点阵
            this.pos.length === 0 && (this.pos = this.calcPos())
            this.draw(this.pos)
        })
    },
    methods: {
        draw(pos) {
            // 初始化图片
            const img = new Image()
            img.src = this.img

            img.onload = () => {
                const self = this
                const doc = document.documentElement
                const canvasEle = self.$refs.canvas
                canvasEle.width = doc.clientWidth
                canvasEle.height = doc.clientHeight
                const context = canvasEle.getContext('2d')

                const proportion = img.width / img.height
                // 水印最大显示
                const max = self.space * 0.8
                const [ width, height ] = img.width >= img.height
                                            ? [ max, parseInt(max / proportion) ]
                                            : [ parseInt(max * proportion), max ]

                drawImg(...pos)
                function drawImg([ x, y ], ...restPos) {
                    context.drawImage(img, x, y, width, height)

                    return restPos.length
                            ? drawImg(...restPos)
                            : undefined
                }
            }
        },
        calcPos() {
            const self = this
            const doc = document.documentElement
            const [ width, height ] = [ doc.clientWidth, doc.clientHeight ]

            // 递归添加 x 轴点坐标
            function pushMatrix(w, h, m) {
                m.push([ w, h ])
                w -= self.space
                h -= self.offset_y
                return w > -self.space
                        ? pushMatrix(w, h, m)
                        : undefined
            }

            // 递归添加点坐标
            function getPos(width, height, matrix) {
                pushMatrix(width, height, matrix)
                width -= self.offset_x
                height -= self.space
                return height > -self.space
                        ? getPos(width, height, matrix)
                        : matrix
            }
            return getPos(width, height, [])
        }
    }
}
</script>
