<template>
    <div class="water-mark" ref="bg" :style="`background-color: ${blur ? 'unset' : '#333'}`">
        <canvas class="water-mark-canvas" ref="canvas"></canvas>
    </div>
</template>

<script>
export default {
    props: {
        blur: {
            type: Boolean
        },
        img: {
            type: String
        },
        // block: {
        //     type: Object,
        //     'default': {

        //     }
        // },
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
            this.pos.length && this.draw(this.pos)
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
                canvasEle.width = doc.clientWidth * 2
                canvasEle.height = doc.clientHeight * 2
                const context = canvasEle.getContext('2d')

                // 宽高比
                const proportion = img.width / img.height
                // 水印最大显示
                const max = self.space * 0.8 * 2
                // 水印图像在 canvas 上的真实大小
                const [ width, height ] = img.width >= img.height
                                            ? [ max, parseInt(max / proportion) ]
                                            : [ parseInt(max * proportion), max ]

                drawImg(...pos)
                function drawImg([ x, y ], ...restPos) {
                    // 绘制水印
                    context.drawImage(img, x * 2, y * 2, width, height)

                    return restPos.length
                            ? drawImg(...restPos)
                            : undefined
                }
            }
        },
        calcPos() {
            const {
                space, // 矩阵间距
                offset_x, // x 轴偏移量
                offset_y // y 轴偏移量
            } = this
            const doc = document.documentElement
            const [ width, height ] = normalizeOrigin(doc.clientWidth, doc.clientHeight)

            function normalizeOrigin(w, h) {
                return [
                    w,
                    h + Math.ceil(w / space) * offset_y
                ]   
            }

            // 递归添加 x 轴点坐标
            function pushMatrix(x, y, pos) {
                return x > 0
                        ? pushMatrix(x - space, y - offset_y, [ ...pos, [ x, y ] ])
                        : [ ...pos, [ x, y ] ]
            }

            // 递归添加 y 轴点坐标
            function getPos(x, y, pos) {
                return y > 0
                        ? getPos(x - offset_x, y - space, pushMatrix(x, y, pos))
                        : pushMatrix(x, y, pos)
            }
            return getPos(width, height, [])
        }
    }
}
</script>

<style lang="less">
.water-mark {
    background-color: #333;
    transition: opacity ease-in-out 0.3s;
    .water-mark-canvas {
        width: 100%;
        height: 100%;
    }
}
</style>
