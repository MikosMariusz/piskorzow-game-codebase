<template>
    <div class="app-background">
        <div class="background-image"></div>
    </div>
</template>

<style scoped>
.app-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
}

.background-image {
    position: absolute;
    top: -10px;
    left: -10px;
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    background-image: url('@/assets/images/app-background.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(5px) brightness(0.7);
}
</style>
