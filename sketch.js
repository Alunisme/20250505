// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

// 圓的初始位置與大小
let circleX = 320; // 畫布中間
let circleY = 240; // 畫布中間
let circleSize = 100;

// 儲存手指軌跡的陣列
let fingerTrail = [];
let isTracking = false;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 畫出圓
  fill(0, 0, 255, 150); // 半透明藍色
  noStroke();
  circle(circleX, circleY, circleSize);

  // 繪製手指軌跡
  stroke(255, 0, 0); // 紅色
  strokeWeight(2);
  noFill();
  beginShape();
  for (let point of fingerTrail) {
    vertex(point.x, point.y);
  }
  endShape();

  // 確保至少有一隻手被偵測到
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 繪製手部關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設定顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255); // 紫色
          } else {
            fill(255, 255, 0); // 黃色
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // 獲取食指的關鍵點 (keypoint[8])
        let indexFinger = hand.keypoints[8];

        // 檢查食指是否接觸圓
        let d = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        if (d < circleSize / 2) {
          // 如果接觸，讓圓跟隨食指移動
          circleX = indexFinger.x;
          circleY = indexFinger.y;

          // 開始追蹤手指軌跡
          isTracking = true;
          fingerTrail.push({ x: indexFinger.x, y: indexFinger.y });
        } else {
          // 停止追蹤手指軌跡
          isTracking = false;
        }

        // 繪製手指連線
        stroke(0, 255, 0); // 綠色
        strokeWeight(2);
        connectKeypoints(hand.keypoints, 0, 4);  // 拇指
        connectKeypoints(hand.keypoints, 5, 8);  // 食指
        connectKeypoints(hand.keypoints, 9, 12); // 中指
        connectKeypoints(hand.keypoints, 13, 16); // 無名指
        connectKeypoints(hand.keypoints, 17, 20); // 小指
      }
    }
  }
}

// Helper function to connect keypoints in a range
function connectKeypoints(keypoints, start, end) {
  for (let i = start; i < end; i++) {
    let kp1 = keypoints[i];
    let kp2 = keypoints[i + 1];
    line(kp1.x, kp1.y, kp2.x, kp2.y);
  }
}
