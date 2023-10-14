<template>
    <div class="wrap">
        <el-card class="print-dialog">
            <el-form :model="form" :rules="rules" ref="form" label-width="95px" size="mini">
                <el-form-item label="纸张大小" prop="pageSize">
                    <el-select v-model="form.pageSize" placeholder="请选择纸张大小" clearable>
                        <el-option v-for="item in pageSizeOptions" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="打印分辨率" prop="resolution">
                    <el-select v-model="form.resolution" placeholder="请选择打印分辨率" clearable>
                        <el-option v-for="item in resolutionOptions" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="比例尺" prop="scale">
                    <el-select v-model="form.scale" placeholder="请选择地图比例尺" clearable>
                        <el-option v-for="item in scaleOptions" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="print('form')">打印</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
import { ScaleLine } from 'ol/control';
import { getPointResolution } from 'ol/proj.js';
import html2canvas from 'html2canvas';

export default {
    name: 'FixedScalePrint',
    inject: ["getMap"],
    computed: {
        map() {
            return this.getMap();
        }
    },
    data() {
        this.dims = {
            'a0': [1189, 841],
            'a1': [841, 594],
            'a2': [594, 420],
            'a3': [420, 297],
            'a4': [297, 210],
            'a5': [210, 148],
        };

        return {
            pageSizeOptions: [
                { value: 'a0', label: 'A0 (1189×841mm)' },
                { value: 'a1', label: 'A1 (841×594mm)' },
                { value: 'a2', label: 'A2 (594×420mm)' },
                { value: 'a3', label: 'A3 (420×297mm)' },
                { value: 'a4', label: 'A4 (297×210mm)' },
                { value: 'a5', label: 'A5 (210×148mm)' },
            ],
            resolutionOptions: [
                { value: '72', label: '72 dpi' },
                { value: '150', label: '150 dpi' },
                { value: '200', label: '200 dpi' },
                { value: '300', label: '300 dpi' },
            ],
            scaleOptions: [
                { value: '1', label: '1:1000' },
                { value: '5', label: '1:5000' },
                { value: '10', label: '1:10000' },
                { value: '25', label: '1:25000' },
                { value: '50', label: '1:50000' },
                { value: '100', label: '1:100000' },
                { value: '250', label: '1:250000' },
                { value: '500', label: '1:500000' },
            ],
            form: {
                pageSize: 'a4',
                resolution: '150',
                scale: '5',
            },
            rules: {
                pageSize: [
                    { required: true, message: '请选择纸张大小', trigger: 'change' },
                ],
                resolution: [
                    { required: true, message: '请选择打印分辨率', trigger: 'change' },
                ],
                scale: [
                    { required: true, message: '请选择地图比例尺', trigger: 'change' },
                ],
            },
        };
    },
    methods: {
        print(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    document.body.style.cursor = 'progress';
                    const { pageSize, resolution, scale } = this.form;
                    const dim = this.dims[pageSize];
                    const width = Math.round((dim[0] * resolution) / 25.4);
                    const height = Math.round((dim[1] * resolution) / 25.4);
                    const viewResolution = this.map.getView().getResolution();
                    const scaleLineControl = this.getControl(this.map, '比例尺');

                    const projection = this.map.getView().getProjection();
                    const mapCenter = this.map.getView().getCenter();
                    const scaleResolution = scale / getPointResolution(projection, resolution / 25.4, mapCenter, 'm');

                    this.map.once('rendercomplete', () => {
                        const exportOptions = {
                            useCORS: true,
                            allowTaint: true,//允许跨域图像渲染canvas,具体参考html2canvasd库的官方文档
                            width, height
                        };
                        html2canvas(this.map.getViewport(), exportOptions).then(canvas => {
                            const url = canvas.toDataURL('image/png');
                            const aLink = document.createElement('a');
                            aLink.style.display = 'none'
                            aLink.href = url;
                            aLink.download = `1: ${scale * 1000}地图.png`;
                            document.body.appendChild(aLink);
                            aLink.click();
                            document.body.removeChild(aLink);
                            //恢复地图初始大小即分辨率
                            scaleLineControl.setDpi();
                            this.map.getTargetElement().style.width = '';
                            this.map.getTargetElement().style.height = '';
                            this.map.updateSize();
                            this.map.updateSize();
                            this.map.getView().setResolution(viewResolution);
                            document.body.style.cursor = 'auto';
                        });
                    });

                    //配置打印时的地图大小
                    scaleLineControl.setDpi(resolution);
                    this.map.getTargetElement().style.width = width + 'px';
                    this.map.getTargetElement().style.height = height + 'px';
                    this.map.updateSize();
                    this.map.getView().setResolution(scaleResolution);
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        //从地图对象中获取地图控件
        getControl(map, controlType) {
            const controls = map.getControls().getArray();
            const type = {
                '比例尺': () => {
                    return (controls.filter(control => {
                        return control instanceof ScaleLine;
                    }))[0];
                },
            };
            return type[controlType]();
        },
    },
}
</script>

<style lang="scss" scoped>
.wrap {
    .print-dialog {
        position: absolute;
        right: 10px;
        top: 10px;
        z-index: 3;
        opacity: 0.95;
    }

    // 自定义elemnt ui卡片外填充
    ::v-deep .el-card__body,
    .el-main {
        padding: 10px;
    }

    //去除表单最后一项的底部填充，使得卡片的四边等距
    ::v-deep .el-form-item:last-child {
        margin-bottom: 0;
    }
}
</style>