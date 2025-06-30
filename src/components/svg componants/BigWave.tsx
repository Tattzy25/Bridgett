import React from 'react';

interface BigWaveProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  stroke?: string;
}

const BigWave: React.FC<BigWaveProps> = ({
  size = 24,
  width,
  height,
  color = 'currentColor',
  fill = 'currentColor',
  stroke,
  className,
  style,
  ...props
}) => {
  return (
    <svg
      width={width || size}
      height={height || size}
      viewBox="0 0 810 1439.999935"
      fill={fill}
      stroke={stroke}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        color,
        ...style,
      }}
      {...props}
    >
      <defs>
        <clipPath id="1930dbcb93">
          <path d="M 325.761719 640.3125 L 484 640.3125 L 484 799.3125 L 325.761719 799.3125 Z M 325.761719 640.3125 " />
        </clipPath>
        <clipPath id="d0bcfb60c7">
          <path d="M 354.414062 717.691406 L 354.390625 718.722656 L 327.347656 718.140625 L 327.390625 716.589844 Z M 331.871094 713.789062 L 331.757812 715.25 L 342.734375 715.9375 L 342.832031 714.691406 Z M 330.15625 710.566406 L 329.972656 712.066406 L 346.019531 713.707031 L 346.167969 712.527344 Z M 336.675781 708.527344 L 336.554688 709.214844 L 336.464844 709.902344 L 352.214844 712.160156 L 352.28125 711.632812 L 352.378906 711.105469 Z M 327.8125 703.820312 C 327.707031 704.335938 327.621094 704.851562 327.523438 705.375 L 347.675781 709.113281 C 347.742188 708.726562 347.804688 708.34375 347.882812 707.964844 Z M 331.191406 701.351562 L 330.847656 702.839844 L 351.472656 707.546875 L 351.71875 706.480469 Z M 334.65625 699.140625 L 334.257812 700.554688 L 344.726562 703.398438 L 345.066406 702.203125 Z M 329.371094 694.199219 L 328.859375 695.714844 L 352.628906 703.238281 L 352.972656 702.207031 Z M 332.476562 691.90625 C 332.292969 692.390625 332.085938 692.871094 331.921875 693.359375 L 355.871094 702.039062 C 355.976562 701.695312 356.121094 701.394531 356.242188 701.066406 Z M 338.667969 691.148438 C 338.460938 691.585938 338.285156 692.035156 338.109375 692.484375 L 358.96875 701.027344 C 359.082031 700.71875 359.199219 700.410156 359.347656 700.109375 Z M 342.5625 689.777344 L 341.992188 691.035156 L 351.9375 695.59375 L 352.417969 694.53125 Z M 336.414062 683.253906 L 335.703125 684.625 L 359.820312 696.917969 L 360.28125 696.015625 Z M 341.683594 682.6875 L 340.953125 683.957031 L 350.554688 689.351562 L 351.175781 688.269531 Z M 341.535156 679.035156 L 340.722656 680.304688 L 354.441406 688.78125 L 355.085938 687.785156 Z M 348.304688 680.050781 L 347.503906 681.183594 L 360.714844 690.0625 L 361.332031 689.191406 Z M 342.375 671.953125 C 342.050781 672.363281 341.726562 672.78125 341.429688 673.214844 L 357.941406 685.363281 C 358.15625 685.042969 358.402344 684.734375 358.628906 684.433594 Z M 346.476562 671.199219 C 346.132812 671.578125 345.839844 671.992188 345.519531 672.386719 L 362.046875 685.609375 C 362.277344 685.324219 362.488281 685.023438 362.734375 684.753906 Z M 350.5625 670.695312 L 349.601562 671.800781 L 357.796875 678.921875 L 358.613281 677.980469 Z M 347.949219 663.957031 L 346.847656 665.109375 L 364.992188 682.21875 L 365.75 681.421875 Z M 351.722656 663.25 L 350.601562 664.320312 L 368.421875 682.539062 L 369.175781 681.816406 Z M 357.652344 665.273438 L 356.5625 666.214844 L 371.65625 682.960938 L 372.410156 682.3125 Z M 361.769531 665.71875 C 361.410156 666.011719 361.035156 666.28125 360.6875 666.585938 L 367.679688 675 C 367.972656 674.742188 368.285156 674.515625 368.589844 674.269531 Z M 359.027344 657.15625 L 358.398438 657.609375 L 357.789062 658.085938 L 374.21875 679.609375 L 374.617188 679.292969 L 375.027344 679 Z M 364.050781 658.90625 C 363.640625 659.175781 363.25 659.464844 362.851562 659.746094 L 369.167969 668.761719 C 369.511719 668.519531 369.855469 668.273438 370.199219 668.042969 Z M 365.496094 655.550781 L 364.222656 656.363281 L 372.945312 669.945312 L 373.941406 669.304688 Z M 371.148438 659.402344 L 369.949219 660.085938 L 378 673.820312 L 378.921875 673.289062 Z M 369.304688 649.539062 L 367.90625 650.261719 L 377.542969 668.363281 L 378.574219 667.832031 Z M 373.335938 650.640625 L 371.964844 651.269531 L 381.132812 670.351562 L 382.128906 669.902344 Z M 377.21875 651.964844 C 376.765625 652.140625 376.308594 652.308594 375.867188 652.527344 L 380.171875 662.484375 C 380.546875 662.304688 380.933594 662.15625 381.320312 662.007812 Z M 377.769531 644.738281 C 377.265625 644.90625 376.777344 645.117188 376.277344 645.304688 L 385.222656 668.597656 C 385.5625 668.46875 385.90625 668.3125 386.25 668.203125 Z M 381.5 645.738281 L 380.023438 646.238281 L 388.1875 670.386719 L 389.171875 670.042969 Z M 385.957031 650.144531 L 384.570312 650.539062 L 390.898438 672.167969 L 391.851562 671.898438 Z M 389.472656 652.34375 L 388.125 652.65625 L 390.761719 663.273438 L 391.894531 663.011719 Z M 390.742188 643.449219 L 389.21875 643.726562 L 394.648438 670.265625 L 395.640625 670.09375 Z M 394.472656 647.207031 L 393.746094 647.300781 L 393.019531 647.429688 L 394.785156 658.296875 L 395.398438 658.1875 L 396.015625 658.109375 Z M 397.214844 644.804688 L 395.722656 644.992188 L 397.660156 661.019531 L 398.832031 660.871094 Z M 400.644531 650.746094 L 399.273438 650.851562 L 400.542969 666.726562 L 401.605469 666.644531 Z M 403.269531 641.070312 L 401.699219 641.109375 L 402.503906 661.613281 L 403.671875 661.582031 Z M 406.410156 643.816406 L 404.894531 643.777344 L 404.894531 664.960938 L 405.992188 664.988281 Z M 409.328125 646.691406 L 408.597656 646.636719 L 407.867188 646.613281 L 407.425781 657.46875 L 408.046875 657.484375 L 408.667969 657.53125 Z M 412.957031 640.414062 L 411.367188 640.289062 L 409.347656 665.160156 L 410.441406 665.242188 Z M 415.875 642.945312 L 414.335938 642.75 L 411.25 668.054688 L 412.277344 668.183594 Z M 418 648.847656 L 416.578125 648.597656 L 412.933594 670.855469 L 413.910156 671.03125 Z M 420.21875 652.347656 L 418.871094 652.039062 L 416.660156 662.753906 L 417.796875 663.015625 Z M 425.210938 644.875 C 424.710938 644.738281 424.214844 644.585938 423.707031 644.476562 L 417.140625 670.753906 C 417.484375 670.820312 417.792969 670.925781 418.117188 671.015625 Z M 426.949219 649.871094 C 426.488281 649.710938 426.011719 649.59375 425.542969 649.453125 L 422.457031 660.019531 C 422.851562 660.140625 423.257812 660.230469 423.648438 660.363281 Z M 430.476562 648.910156 L 429.042969 648.425781 L 423.863281 663.714844 L 424.984375 664.089844 Z M 430.996094 655.75 L 429.738281 655.246094 L 424.007812 670.101562 L 424.996094 670.492188 Z M 437.5625 648.171875 L 436.125 647.519531 L 427.96875 666.34375 L 429.027344 666.824219 Z M 439.207031 652.011719 L 437.851562 651.324219 L 428.644531 670.390625 L 429.621094 670.894531 Z M 440.578125 655.878906 C 440.15625 655.636719 439.738281 655.382812 439.300781 655.167969 L 434.183594 664.746094 C 434.554688 664.929688 434.914062 665.144531 435.273438 665.351562 Z M 446.613281 651.8125 C 446.171875 651.515625 445.699219 651.261719 445.242188 650.996094 L 432.601562 672.5 C 432.914062 672.683594 433.238281 672.84375 433.542969 673.058594 Z M 448.148438 655.347656 L 446.84375 654.503906 L 433.042969 675.933594 L 433.921875 676.496094 Z M 447.488281 661.585938 L 446.316406 660.75 L 433.339844 679.199219 L 434.148438 679.773438 Z M 447.957031 665.707031 L 446.871094 664.851562 L 440.222656 673.539062 L 441.140625 674.261719 Z M 455.691406 661.15625 L 454.519531 660.125 L 437.1875 680.929688 L 437.953125 681.597656 Z M 455.078125 666.414062 C 454.734375 666.070312 454.394531 665.726562 454.011719 665.410156 L 446.628906 673.574219 C 446.941406 673.851562 447.234375 674.148438 447.539062 674.433594 Z M 458.671875 667.070312 L 458.152344 666.527344 L 457.605469 666.007812 L 446.308594 677.527344 L 446.738281 677.9375 L 447.144531 678.367188 Z M 456.191406 673.441406 C 455.886719 673.101562 455.558594 672.757812 455.242188 672.433594 L 443.628906 683.34375 C 443.871094 683.605469 444.128906 683.851562 444.359375 684.125 Z M 465.386719 669.460938 L 464.355469 668.265625 L 448.863281 681.683594 L 449.628906 682.5625 Z M 465.199219 673.640625 L 464.261719 672.441406 L 447.722656 685.644531 L 448.40625 686.507812 Z M 464.769531 677.722656 L 463.917969 676.53125 L 455.167969 682.953125 L 455.890625 683.984375 Z M 471.921875 676.664062 L 471.070312 675.320312 L 450.371094 689.238281 L 450.960938 690.160156 Z M 471.777344 680.515625 C 471.511719 680.070312 471.273438 679.609375 470.984375 679.179688 L 449.289062 692.53125 C 449.484375 692.816406 449.632812 693.128906 449.816406 693.429688 Z M 468.5 685.851562 C 468.289062 685.417969 468.042969 685.007812 467.816406 684.589844 L 448.152344 695.605469 C 448.316406 695.894531 448.496094 696.175781 448.632812 696.472656 Z M 467.15625 689.765625 L 466.527344 688.53125 L 456.78125 693.484375 L 457.3125 694.515625 Z M 476.09375 689.019531 L 475.457031 687.601562 L 450.832031 698.851562 L 451.25 699.769531 Z M 473.257812 693.503906 L 472.71875 692.132812 L 462.535156 696.285156 L 462.992188 697.445312 Z M 476.214844 695.660156 L 475.730469 694.230469 L 460.558594 699.707031 L 460.933594 700.828125 Z M 471.210938 700.328125 C 471.078125 699.886719 470.96875 699.4375 470.820312 699 L 455.632812 703.785156 C 455.75 704.128906 455.832031 704.46875 455.933594 704.8125 Z M 481.234375 700.742188 C 481.121094 700.226562 480.976562 699.710938 480.832031 699.214844 L 461.046875 704.5625 C 461.15625 704.9375 461.265625 705.308594 461.34375 705.691406 Z M 479.269531 704.421875 L 478.925781 702.9375 L 458.289062 707.617188 L 458.539062 708.6875 Z M 477.09375 707.917969 L 476.835938 706.472656 L 466.164062 708.441406 L 466.382812 709.667969 Z M 483.992188 710.085938 L 483.785156 708.5 L 459.105469 712.007812 L 459.242188 713.09375 Z M 482.179688 713.488281 L 482.058594 711.941406 L 456.714844 714.492188 L 456.789062 715.523438 Z M 476.902344 716.859375 L 476.878906 716.136719 L 476.828125 715.417969 L 454.335938 716.769531 L 454.375 717.261719 L 454.375 717.765625 Z M 473.992188 719.792969 L 473.957031 718.421875 L 463.03125 718.636719 L 463.0625 719.804688 Z M 482.363281 722.996094 L 482.390625 721.449219 L 455.332031 720.878906 L 455.308594 721.910156 Z M 477.867188 725.796875 L 477.976562 724.335938 L 467.003906 723.648438 L 466.90625 724.894531 Z M 479.582031 729.019531 L 479.769531 727.523438 L 463.722656 725.882812 L 463.570312 727.058594 Z M 473.066406 731.058594 L 473.1875 730.371094 L 473.277344 729.683594 L 457.527344 727.425781 L 457.460938 727.953125 L 457.363281 728.480469 Z M 481.929688 735.765625 C 482.035156 735.25 482.121094 734.734375 482.21875 734.214844 L 462.066406 730.476562 C 461.996094 730.859375 461.9375 731.246094 461.859375 731.621094 Z M 478.550781 738.234375 L 478.894531 736.746094 L 458.269531 732.039062 L 458.023438 733.109375 Z M 475.085938 740.445312 L 475.484375 739.019531 L 465.015625 736.175781 L 464.671875 737.371094 Z M 480.367188 745.390625 L 480.878906 743.871094 L 457.113281 736.347656 L 456.769531 737.378906 Z M 477.28125 747.679688 C 477.46875 747.195312 477.671875 746.71875 477.835938 746.226562 L 453.886719 737.546875 C 453.78125 737.890625 453.636719 738.191406 453.515625 738.519531 Z M 471.070312 748.4375 C 471.277344 748.003906 471.453125 747.550781 471.628906 747.101562 L 450.769531 738.5625 C 450.652344 738.871094 450.539062 739.179688 450.390625 739.476562 Z M 467.171875 749.8125 L 467.746094 748.550781 L 457.800781 743.996094 L 457.320312 745.058594 Z M 473.324219 756.335938 L 474.035156 754.960938 L 449.917969 742.671875 L 449.457031 743.574219 Z M 468.054688 756.902344 L 468.785156 755.632812 L 459.179688 750.238281 L 458.558594 751.320312 Z M 468.203125 760.550781 L 469.011719 759.304688 L 455.292969 750.832031 L 454.648438 751.828125 Z M 461.433594 759.539062 L 462.234375 758.40625 L 449.042969 749.503906 L 448.425781 750.371094 Z M 467.34375 767.660156 C 467.6875 767.246094 467.992188 766.832031 468.292969 766.398438 L 451.777344 754.246094 C 451.5625 754.570312 451.320312 754.875 451.09375 755.179688 Z M 463.230469 768.410156 C 463.570312 768.03125 463.863281 767.621094 464.183594 767.226562 L 447.65625 754 C 447.425781 754.285156 447.21875 754.585938 446.96875 754.859375 Z M 459.175781 768.890625 L 460.136719 767.785156 L 451.941406 760.664062 L 451.125 761.609375 Z M 461.789062 775.636719 L 462.890625 774.484375 L 444.742188 757.375 L 443.988281 758.171875 Z M 458.015625 776.34375 L 459.136719 775.273438 L 441.300781 757.054688 L 440.546875 757.777344 Z M 452.085938 774.324219 L 453.175781 773.378906 L 438.082031 756.632812 L 437.328125 757.28125 Z M 447.96875 773.875 C 448.3125 773.585938 448.703125 773.3125 449.046875 773.007812 L 442.058594 764.597656 C 441.765625 764.855469 441.449219 765.082031 441.148438 765.324219 Z M 450.710938 782.4375 L 451.339844 781.984375 L 451.949219 781.507812 L 435.519531 759.984375 L 435.121094 760.300781 L 434.710938 760.59375 Z M 445.6875 780.679688 C 446.09375 780.410156 446.488281 780.121094 446.886719 779.839844 L 440.570312 770.828125 C 440.226562 771.066406 439.882812 771.316406 439.539062 771.546875 Z M 444.242188 784.035156 L 445.515625 783.226562 L 436.792969 769.644531 L 435.808594 770.265625 Z M 438.589844 780.1875 L 439.789062 779.5 L 431.738281 765.765625 L 430.8125 766.300781 Z M 440.433594 790.046875 L 441.832031 789.328125 L 432.191406 771.222656 L 431.164062 771.753906 Z M 436.402344 788.945312 L 437.773438 788.316406 L 428.605469 769.234375 L 427.605469 769.683594 Z M 432.519531 787.625 C 432.972656 787.441406 433.429688 787.28125 433.871094 787.0625 L 429.566406 777.105469 C 429.191406 777.28125 428.804688 777.445312 428.417969 777.582031 Z M 431.957031 794.832031 C 432.460938 794.664062 432.953125 794.453125 433.449219 794.265625 L 424.507812 770.972656 C 424.164062 771.101562 423.820312 771.257812 423.476562 771.367188 Z M 428.226562 793.832031 L 429.703125 793.332031 L 421.550781 769.183594 L 420.566406 769.527344 Z M 423.769531 789.425781 L 425.15625 789.03125 L 418.828125 767.382812 L 417.875 767.65625 Z M 420.257812 787.226562 L 421.605469 786.914062 L 418.964844 776.296875 L 417.835938 776.558594 Z M 418.984375 796.121094 L 420.511719 795.84375 L 415.082031 769.308594 L 414.085938 769.476562 Z M 415.253906 792.34375 L 415.984375 792.25 L 416.707031 792.125 L 414.941406 781.257812 L 414.328125 781.363281 L 413.710938 781.445312 Z M 412.511719 794.746094 L 414.007812 794.5625 L 412.070312 778.535156 L 410.894531 778.683594 Z M 409.082031 788.808594 L 410.453125 788.703125 L 409.183594 772.824219 L 408.121094 772.910156 Z M 406.457031 798.484375 L 408.027344 798.441406 L 407.222656 777.941406 L 406.054688 777.972656 Z M 403.320312 795.738281 L 404.835938 795.773438 L 404.835938 774.59375 L 403.738281 774.5625 Z M 400.398438 792.863281 L 401.097656 792.957031 L 401.828125 792.976562 L 402.269531 782.125 L 401.644531 782.105469 L 401.023438 782.058594 Z M 396.769531 799.140625 L 398.351562 799.300781 L 400.371094 774.433594 L 399.277344 774.351562 Z M 393.851562 796.609375 L 395.390625 796.804688 L 398.480469 771.5 L 397.449219 771.371094 Z M 391.726562 790.707031 L 393.148438 790.957031 L 396.792969 768.699219 L 395.816406 768.523438 Z M 389.507812 787.203125 L 390.855469 787.515625 L 393.066406 776.796875 L 391.929688 776.539062 Z M 384.519531 794.679688 C 385.015625 794.816406 385.511719 794.96875 386.019531 795.078125 L 392.585938 768.796875 C 392.242188 768.734375 391.933594 768.625 391.613281 768.539062 Z M 382.777344 789.679688 C 383.238281 789.839844 383.714844 789.957031 384.183594 790.097656 L 387.273438 779.574219 C 386.875 779.453125 386.46875 779.359375 386.078125 779.230469 Z M 379.253906 790.640625 L 380.683594 791.128906 L 385.847656 775.878906 L 384.726562 775.5 Z M 378.730469 783.800781 L 380 784.339844 L 385.730469 769.484375 L 384.742188 769.09375 Z M 372.167969 791.382812 L 373.601562 792.03125 L 381.742188 773.25 L 380.683594 772.765625 Z M 370.519531 787.542969 L 371.875 788.226562 L 381.0625 769.203125 L 380.089844 768.699219 Z M 369.148438 783.675781 C 369.574219 783.914062 369.988281 784.167969 370.425781 784.386719 L 375.542969 774.808594 C 375.171875 774.625 374.8125 774.410156 374.453125 774.203125 Z M 363.125 787.773438 C 363.566406 788.070312 364.035156 788.324219 364.496094 788.59375 L 377.136719 767.089844 C 376.824219 766.902344 376.5 766.746094 376.195312 766.527344 Z M 361.585938 784.242188 L 362.894531 785.082031 L 376.695312 763.65625 L 375.816406 763.09375 Z M 362.25 778 L 363.421875 778.847656 L 376.398438 760.386719 L 375.589844 759.8125 Z M 361.78125 773.878906 L 362.867188 774.726562 L 369.515625 766.042969 L 368.597656 765.320312 Z M 354.046875 778.433594 L 355.21875 779.460938 L 372.550781 758.65625 L 371.785156 757.988281 Z M 354.660156 773.171875 C 355 773.515625 355.363281 773.859375 355.726562 774.179688 L 363.105469 766.015625 C 362.796875 765.734375 362.503906 765.441406 362.199219 765.15625 Z M 351.066406 772.515625 L 351.585938 773.058594 L 352.132812 773.582031 L 363.429688 762.058594 L 363 761.648438 L 362.59375 761.222656 Z M 353.546875 766.144531 C 353.847656 766.488281 354.179688 766.832031 354.496094 767.152344 L 366.089844 756.25 C 365.847656 755.988281 365.589844 755.742188 365.359375 755.46875 Z M 344.351562 770.132812 L 345.378906 771.328125 L 360.875 757.90625 L 360.109375 757.027344 Z M 344.535156 765.957031 L 345.476562 767.152344 L 362.015625 753.949219 L 361.332031 753.085938 Z M 344.96875 761.871094 L 345.820312 763.054688 L 354.570312 756.632812 L 353.847656 755.605469 Z M 337.816406 762.929688 L 338.667969 764.265625 L 359.367188 750.351562 L 358.777344 749.425781 Z M 337.960938 759.078125 C 338.226562 759.523438 338.464844 759.984375 338.753906 760.414062 L 360.449219 747.054688 C 360.253906 746.769531 360.105469 746.457031 359.921875 746.160156 Z M 341.238281 753.742188 C 341.449219 754.175781 341.691406 754.585938 341.921875 755.007812 L 361.585938 743.988281 C 361.417969 743.699219 361.242188 743.417969 361.105469 743.121094 Z M 342.582031 749.828125 L 343.210938 751.039062 L 352.957031 746.085938 L 352.425781 745.058594 Z M 333.644531 750.574219 L 334.28125 751.992188 L 358.90625 740.738281 L 358.488281 739.816406 Z M 336.480469 746.089844 L 337.019531 747.464844 L 347.203125 743.308594 L 346.746094 742.148438 Z M 333.53125 743.933594 L 334.015625 745.363281 L 349.191406 739.890625 L 348.8125 738.765625 Z M 338.539062 739.265625 C 338.671875 739.707031 338.78125 740.15625 338.929688 740.59375 L 354.101562 735.804688 C 353.988281 735.460938 353.90625 735.117188 353.804688 734.773438 Z M 328.515625 738.851562 C 328.628906 739.367188 328.773438 739.882812 328.914062 740.378906 L 348.699219 735.03125 C 348.589844 734.65625 348.480469 734.285156 348.40625 733.90625 Z M 330.480469 735.171875 L 330.824219 736.65625 L 351.457031 731.976562 L 351.207031 730.90625 Z M 332.65625 731.675781 L 332.910156 733.121094 L 343.582031 731.15625 L 343.363281 729.925781 Z M 325.757812 729.511719 L 325.960938 731.09375 L 350.660156 727.585938 L 350.523438 726.5 Z M 327.566406 726.109375 L 327.691406 727.652344 L 353.03125 725.101562 L 352.957031 724.070312 Z M 332.835938 722.730469 L 332.855469 723.449219 L 332.910156 724.167969 L 355.402344 722.820312 L 355.363281 722.324219 L 355.363281 721.824219 Z M 335.746094 719.792969 L 335.78125 721.167969 L 346.707031 720.949219 L 346.675781 719.785156 Z M 335.746094 719.792969 " />
        </clipPath>
        <linearGradient
          x1="250"
          gradientTransform="matrix(-0.343011,0,0,-0.343338,490.621726,805.628424)"
          y1="481.5"
          x2="250"
          gradientUnits="userSpaceOnUse"
          y2="18.430051"
          id="f215e67af0"
        >
          <stop style="stop-color:#17fff3;stop-opacity:1;" offset="0" />
          <stop
            style="stop-color:#18fdf3;stop-opacity:1;"
            offset="0.00390625"
          />
          <stop style="stop-color:#19fbf3;stop-opacity:1;" offset="0.0078125" />
          <stop style="stop-color:#1af9f3;stop-opacity:1;" offset="0.0117187" />
          <stop style="stop-color:#1bf8f3;stop-opacity:1;" offset="0.015625" />
          <stop style="stop-color:#1cf6f3;stop-opacity:1;" offset="0.0195312" />
          <stop style="stop-color:#1cf4f4;stop-opacity:1;" offset="0.0234375" />
          <stop style="stop-color:#1df2f4;stop-opacity:1;" offset="0.0273437" />
          <stop style="stop-color:#1ef0f4;stop-opacity:1;" offset="0.03125" />
          <stop style="stop-color:#1feff4;stop-opacity:1;" offset="0.0351562" />
          <stop style="stop-color:#20edf4;stop-opacity:1;" offset="0.0390625" />
          <stop style="stop-color:#21ebf4;stop-opacity:1;" offset="0.0429687" />
          <stop style="stop-color:#22e9f4;stop-opacity:1;" offset="0.046875" />
          <stop style="stop-color:#23e7f4;stop-opacity:1;" offset="0.0507812" />
          <stop style="stop-color:#24e6f4;stop-opacity:1;" offset="0.0546875" />
          <stop style="stop-color:#25e4f4;stop-opacity:1;" offset="0.0585937" />
          <stop style="stop-color:#25e2f5;stop-opacity:1;" offset="0.0625" />
          <stop style="stop-color:#26e0f5;stop-opacity:1;" offset="0.0664062" />
          <stop style="stop-color:#27def5;stop-opacity:1;" offset="0.0703125" />
          <stop style="stop-color:#28dcf5;stop-opacity:1;" offset="0.0742188" />
          <stop style="stop-color:#29dbf5;stop-opacity:1;" offset="0.078125" />
          <stop style="stop-color:#2ad9f5;stop-opacity:1;" offset="0.0820312" />
          <stop style="stop-color:#2bd7f5;stop-opacity:1;" offset="0.0859375" />
          <stop style="stop-color:#2cd5f5;stop-opacity:1;" offset="0.0898437" />
          <stop style="stop-color:#2dd3f5;stop-opacity:1;" offset="0.09375" />
          <stop style="stop-color:#2ed2f5;stop-opacity:1;" offset="0.0976562" />
          <stop style="stop-color:#2fd0f5;stop-opacity:1;" offset="0.101562" />
          <stop style="stop-color:#2fcef6;stop-opacity:1;" offset="0.105469" />
          <stop style="stop-color:#30ccf6;stop-opacity:1;" offset="0.109375" />
          <stop style="stop-color:#31caf6;stop-opacity:1;" offset="0.113281" />
          <stop style="stop-color:#32c9f6;stop-opacity:1;" offset="0.117187" />
          <stop style="stop-color:#33c7f6;stop-opacity:1;" offset="0.121094" />
          <stop style="stop-color:#34c5f6;stop-opacity:1;" offset="0.125" />
          <stop style="stop-color:#35c3f6;stop-opacity:1;" offset="0.128906" />
          <stop style="stop-color:#36c1f6;stop-opacity:1;" offset="0.132812" />
          <stop style="stop-color:#37bff6;stop-opacity:1;" offset="0.136719" />
          <stop style="stop-color:#38bef6;stop-opacity:1;" offset="0.140625" />
          <stop style="stop-color:#39bcf6;stop-opacity:1;" offset="0.144531" />
          <stop style="stop-color:#39baf7;stop-opacity:1;" offset="0.148438" />
          <stop style="stop-color:#3ab8f7;stop-opacity:1;" offset="0.152344" />
          <stop style="stop-color:#3bb6f7;stop-opacity:1;" offset="0.15625" />
          <stop style="stop-color:#3cb5f7;stop-opacity:1;" offset="0.160156" />
          <stop style="stop-color:#3db3f7;stop-opacity:1;" offset="0.164063" />
          <stop style="stop-color:#3eb1f7;stop-opacity:1;" offset="0.167969" />
          <stop style="stop-color:#3faff7;stop-opacity:1;" offset="0.171875" />
          <stop style="stop-color:#40adf7;stop-opacity:1;" offset="0.175781" />
          <stop style="stop-color:#41acf7;stop-opacity:1;" offset="0.179687" />
          <stop style="stop-color:#42aaf7;stop-opacity:1;" offset="0.183594" />
          <stop style="stop-color:#42a8f8;stop-opacity:1;" offset="0.1875" />
          <stop style="stop-color:#43a6f8;stop-opacity:1;" offset="0.191406" />
          <stop style="stop-color:#44a4f8;stop-opacity:1;" offset="0.195312" />
          <stop style="stop-color:#45a2f8;stop-opacity:1;" offset="0.199219" />
          <stop style="stop-color:#46a1f8;stop-opacity:1;" offset="0.203125" />
          <stop style="stop-color:#479ff8;stop-opacity:1;" offset="0.207031" />
          <stop style="stop-color:#489df8;stop-opacity:1;" offset="0.210938" />
          <stop style="stop-color:#499bf8;stop-opacity:1;" offset="0.214844" />
          <stop style="stop-color:#4a99f8;stop-opacity:1;" offset="0.21875" />
          <stop style="stop-color:#4b98f8;stop-opacity:1;" offset="0.222656" />
          <stop style="stop-color:#4c96f8;stop-opacity:1;" offset="0.226562" />
          <stop style="stop-color:#4c94f9;stop-opacity:1;" offset="0.230469" />
          <stop style="stop-color:#4d92f9;stop-opacity:1;" offset="0.234375" />
          <stop style="stop-color:#4e90f9;stop-opacity:1;" offset="0.238281" />
          <stop style="stop-color:#4f8ff9;stop-opacity:1;" offset="0.242188" />
          <stop style="stop-color:#508df9;stop-opacity:1;" offset="0.246094" />
          <stop style="stop-color:#518bf9;stop-opacity:1;" offset="0.25" />
          <stop style="stop-color:#5289f9;stop-opacity:1;" offset="0.253906" />
          <stop style="stop-color:#5387f9;stop-opacity:1;" offset="0.257812" />
          <stop style="stop-color:#5485f9;stop-opacity:1;" offset="0.261719" />
          <stop style="stop-color:#5584f9;stop-opacity:1;" offset="0.265625" />
          <stop style="stop-color:#5682f9;stop-opacity:1;" offset="0.269531" />
          <stop style="stop-color:#5680fa;stop-opacity:1;" offset="0.273438" />
          <stop style="stop-color:#577efa;stop-opacity:1;" offset="0.277344" />
          <stop style="stop-color:#587cfa;stop-opacity:1;" offset="0.28125" />
          <stop style="stop-color:#597bfa;stop-opacity:1;" offset="0.285156" />
          <stop style="stop-color:#5a79fa;stop-opacity:1;" offset="0.289062" />
          <stop style="stop-color:#5b77fa;stop-opacity:1;" offset="0.292969" />
          <stop style="stop-color:#5c75fa;stop-opacity:1;" offset="0.296875" />
          <stop style="stop-color:#5d73fa;stop-opacity:1;" offset="0.300781" />
          <stop style="stop-color:#5e72fa;stop-opacity:1;" offset="0.304688" />
          <stop style="stop-color:#5f70fa;stop-opacity:1;" offset="0.308594" />
          <stop style="stop-color:#5f6efb;stop-opacity:1;" offset="0.3125" />
          <stop style="stop-color:#606cfb;stop-opacity:1;" offset="0.316406" />
          <stop style="stop-color:#616afb;stop-opacity:1;" offset="0.320312" />
          <stop style="stop-color:#6268fb;stop-opacity:1;" offset="0.324219" />
          <stop style="stop-color:#6367fb;stop-opacity:1;" offset="0.328125" />
          <stop style="stop-color:#6465fb;stop-opacity:1;" offset="0.332031" />
          <stop style="stop-color:#6563fb;stop-opacity:1;" offset="0.335937" />
          <stop style="stop-color:#6661fb;stop-opacity:1;" offset="0.339844" />
          <stop style="stop-color:#675ffb;stop-opacity:1;" offset="0.34375" />
          <stop style="stop-color:#685efb;stop-opacity:1;" offset="0.347656" />
          <stop style="stop-color:#695cfb;stop-opacity:1;" offset="0.351562" />
          <stop style="stop-color:#695afc;stop-opacity:1;" offset="0.355469" />
          <stop style="stop-color:#6a58fc;stop-opacity:1;" offset="0.359375" />
          <stop style="stop-color:#6b56fc;stop-opacity:1;" offset="0.363281" />
          <stop style="stop-color:#6c55fc;stop-opacity:1;" offset="0.367188" />
          <stop style="stop-color:#6d53fc;stop-opacity:1;" offset="0.371094" />
          <stop style="stop-color:#6e51fc;stop-opacity:1;" offset="0.375" />
          <stop style="stop-color:#6f4ffc;stop-opacity:1;" offset="0.378906" />
          <stop style="stop-color:#704dfc;stop-opacity:1;" offset="0.382812" />
          <stop style="stop-color:#714bfc;stop-opacity:1;" offset="0.386719" />
          <stop style="stop-color:#724afc;stop-opacity:1;" offset="0.390625" />
          <stop style="stop-color:#7348fc;stop-opacity:1;" offset="0.394531" />
          <stop style="stop-color:#7346fd;stop-opacity:1;" offset="0.398438" />
          <stop style="stop-color:#7444fd;stop-opacity:1;" offset="0.402344" />
          <stop style="stop-color:#7542fd;stop-opacity:1;" offset="0.40625" />
          <stop style="stop-color:#7641fd;stop-opacity:1;" offset="0.410156" />
          <stop style="stop-color:#773ffd;stop-opacity:1;" offset="0.414062" />
          <stop style="stop-color:#783dfd;stop-opacity:1;" offset="0.417969" />
          <stop style="stop-color:#793bfd;stop-opacity:1;" offset="0.421875" />
          <stop style="stop-color:#7a39fd;stop-opacity:1;" offset="0.425781" />
          <stop style="stop-color:#7b38fd;stop-opacity:1;" offset="0.429688" />
          <stop style="stop-color:#7c36fd;stop-opacity:1;" offset="0.433594" />
          <stop style="stop-color:#7c34fe;stop-opacity:1;" offset="0.4375" />
          <stop style="stop-color:#7d32fe;stop-opacity:1;" offset="0.441406" />
          <stop style="stop-color:#7e30fe;stop-opacity:1;" offset="0.445312" />
          <stop style="stop-color:#7f2efe;stop-opacity:1;" offset="0.449219" />
          <stop style="stop-color:#802dfe;stop-opacity:1;" offset="0.453125" />
          <stop style="stop-color:#812bfe;stop-opacity:1;" offset="0.457031" />
          <stop style="stop-color:#8229fe;stop-opacity:1;" offset="0.460937" />
          <stop style="stop-color:#8327fe;stop-opacity:1;" offset="0.464844" />
          <stop style="stop-color:#8425fe;stop-opacity:1;" offset="0.46875" />
          <stop style="stop-color:#8524fe;stop-opacity:1;" offset="0.472656" />
          <stop style="stop-color:#8622fe;stop-opacity:1;" offset="0.476562" />
          <stop style="stop-color:#8620ff;stop-opacity:1;" offset="0.480469" />
          <stop style="stop-color:#871eff;stop-opacity:1;" offset="0.484375" />
          <stop style="stop-color:#881cff;stop-opacity:1;" offset="0.488281" />
          <stop style="stop-color:#891bff;stop-opacity:1;" offset="0.492188" />
          <stop style="stop-color:#8a19ff;stop-opacity:1;" offset="0.496094" />
          <stop style="stop-color:#8b17ff;stop-opacity:1;" offset="0.5" />
          <stop style="stop-color:#8c17fe;stop-opacity:1;" offset="0.503906" />
          <stop style="stop-color:#8c17fe;stop-opacity:1;" offset="0.507813" />
          <stop style="stop-color:#8d16fd;stop-opacity:1;" offset="0.511719" />
          <stop style="stop-color:#8e16fc;stop-opacity:1;" offset="0.515625" />
          <stop style="stop-color:#8f16fc;stop-opacity:1;" offset="0.519531" />
          <stop style="stop-color:#8f16fb;stop-opacity:1;" offset="0.523438" />
          <stop style="stop-color:#9016fb;stop-opacity:1;" offset="0.527344" />
          <stop style="stop-color:#9115fa;stop-opacity:1;" offset="0.53125" />
          <stop style="stop-color:#9215f9;stop-opacity:1;" offset="0.535156" />
          <stop style="stop-color:#9215f9;stop-opacity:1;" offset="0.539063" />
          <stop style="stop-color:#9315f8;stop-opacity:1;" offset="0.542969" />
          <stop style="stop-color:#9415f7;stop-opacity:1;" offset="0.546875" />
          <stop style="stop-color:#9415f7;stop-opacity:1;" offset="0.550781" />
          <stop style="stop-color:#9514f6;stop-opacity:1;" offset="0.554688" />
          <stop style="stop-color:#9614f6;stop-opacity:1;" offset="0.558594" />
          <stop style="stop-color:#9714f5;stop-opacity:1;" offset="0.5625" />
          <stop style="stop-color:#9714f4;stop-opacity:1;" offset="0.566406" />
          <stop style="stop-color:#9814f4;stop-opacity:1;" offset="0.570313" />
          <stop style="stop-color:#9913f3;stop-opacity:1;" offset="0.574219" />
          <stop style="stop-color:#9913f2;stop-opacity:1;" offset="0.578125" />
          <stop style="stop-color:#9a13f2;stop-opacity:1;" offset="0.582031" />
          <stop style="stop-color:#9b13f1;stop-opacity:1;" offset="0.585938" />
          <stop style="stop-color:#9c13f0;stop-opacity:1;" offset="0.589844" />
          <stop style="stop-color:#9c13f0;stop-opacity:1;" offset="0.59375" />
          <stop style="stop-color:#9d12ef;stop-opacity:1;" offset="0.597656" />
          <stop style="stop-color:#9e12ef;stop-opacity:1;" offset="0.601563" />
          <stop style="stop-color:#9f12ee;stop-opacity:1;" offset="0.605469" />
          <stop style="stop-color:#9f12ed;stop-opacity:1;" offset="0.609375" />
          <stop style="stop-color:#a012ed;stop-opacity:1;" offset="0.613281" />
          <stop style="stop-color:#a111ec;stop-opacity:1;" offset="0.617188" />
          <stop style="stop-color:#a111eb;stop-opacity:1;" offset="0.621094" />
          <stop style="stop-color:#a211eb;stop-opacity:1;" offset="0.625" />
          <stop style="stop-color:#a311ea;stop-opacity:1;" offset="0.628906" />
          <stop style="stop-color:#a411ea;stop-opacity:1;" offset="0.632813" />
          <stop style="stop-color:#a411e9;stop-opacity:1;" offset="0.636719" />
          <stop style="stop-color:#a510e8;stop-opacity:1;" offset="0.640625" />
          <stop style="stop-color:#a610e8;stop-opacity:1;" offset="0.644531" />
          <stop style="stop-color:#a710e7;stop-opacity:1;" offset="0.648438" />
          <stop style="stop-color:#a710e6;stop-opacity:1;" offset="0.652344" />
          <stop style="stop-color:#a810e6;stop-opacity:1;" offset="0.65625" />
          <stop style="stop-color:#a90fe5;stop-opacity:1;" offset="0.660156" />
          <stop style="stop-color:#a90fe5;stop-opacity:1;" offset="0.664062" />
          <stop style="stop-color:#aa0fe4;stop-opacity:1;" offset="0.667969" />
          <stop style="stop-color:#ab0fe3;stop-opacity:1;" offset="0.671875" />
          <stop style="stop-color:#ac0fe3;stop-opacity:1;" offset="0.675781" />
          <stop style="stop-color:#ac0fe2;stop-opacity:1;" offset="0.679688" />
          <stop style="stop-color:#ad0ee1;stop-opacity:1;" offset="0.683594" />
          <stop style="stop-color:#ae0ee1;stop-opacity:1;" offset="0.6875" />
          <stop style="stop-color:#af0ee0;stop-opacity:1;" offset="0.691406" />
          <stop style="stop-color:#af0edf;stop-opacity:1;" offset="0.695312" />
          <stop style="stop-color:#b00edf;stop-opacity:1;" offset="0.699219" />
          <stop style="stop-color:#b10dde;stop-opacity:1;" offset="0.703125" />
          <stop style="stop-color:#b10dde;stop-opacity:1;" offset="0.707031" />
          <stop style="stop-color:#b20ddd;stop-opacity:1;" offset="0.710938" />
          <stop style="stop-color:#b30ddc;stop-opacity:1;" offset="0.714844" />
          <stop style="stop-color:#b40ddc;stop-opacity:1;" offset="0.71875" />
          <stop style="stop-color:#b40ddb;stop-opacity:1;" offset="0.722656" />
          <stop style="stop-color:#b50cda;stop-opacity:1;" offset="0.726563" />
          <stop style="stop-color:#b60cda;stop-opacity:1;" offset="0.730469" />
          <stop style="stop-color:#b70cd9;stop-opacity:1;" offset="0.734375" />
          <stop style="stop-color:#b70cd9;stop-opacity:1;" offset="0.738281" />
          <stop style="stop-color:#b80cd8;stop-opacity:1;" offset="0.742188" />
          <stop style="stop-color:#b90bd7;stop-opacity:1;" offset="0.746094" />
          <stop style="stop-color:#b90bd7;stop-opacity:1;" offset="0.75" />
          <stop style="stop-color:#ba0bd6;stop-opacity:1;" offset="0.753906" />
          <stop style="stop-color:#bb0bd5;stop-opacity:1;" offset="0.757813" />
          <stop style="stop-color:#bc0bd5;stop-opacity:1;" offset="0.761719" />
          <stop style="stop-color:#bc0bd4;stop-opacity:1;" offset="0.765625" />
          <stop style="stop-color:#bd0ad4;stop-opacity:1;" offset="0.769531" />
          <stop style="stop-color:#be0ad3;stop-opacity:1;" offset="0.773438" />
          <stop style="stop-color:#bf0ad2;stop-opacity:1;" offset="0.777344" />
          <stop style="stop-color:#bf0ad2;stop-opacity:1;" offset="0.78125" />
          <stop style="stop-color:#c00ad1;stop-opacity:1;" offset="0.785156" />
          <stop style="stop-color:#c109d0;stop-opacity:1;" offset="0.789063" />
          <stop style="stop-color:#c109d0;stop-opacity:1;" offset="0.792969" />
          <stop style="stop-color:#c209cf;stop-opacity:1;" offset="0.796875" />
          <stop style="stop-color:#c309ce;stop-opacity:1;" offset="0.800781" />
          <stop style="stop-color:#c409ce;stop-opacity:1;" offset="0.804688" />
          <stop style="stop-color:#c408cd;stop-opacity:1;" offset="0.808594" />
          <stop style="stop-color:#c508cd;stop-opacity:1;" offset="0.8125" />
          <stop style="stop-color:#c608cc;stop-opacity:1;" offset="0.816406" />
          <stop style="stop-color:#c608cb;stop-opacity:1;" offset="0.820312" />
          <stop style="stop-color:#c708cb;stop-opacity:1;" offset="0.824219" />
          <stop style="stop-color:#c808ca;stop-opacity:1;" offset="0.828125" />
          <stop style="stop-color:#c907c9;stop-opacity:1;" offset="0.832031" />
          <stop style="stop-color:#c907c9;stop-opacity:1;" offset="0.835938" />
          <stop style="stop-color:#ca07c8;stop-opacity:1;" offset="0.839844" />
          <stop style="stop-color:#cb07c8;stop-opacity:1;" offset="0.84375" />
          <stop style="stop-color:#cc07c7;stop-opacity:1;" offset="0.847656" />
          <stop style="stop-color:#cc06c6;stop-opacity:1;" offset="0.851562" />
          <stop style="stop-color:#cd06c6;stop-opacity:1;" offset="0.855469" />
          <stop style="stop-color:#ce06c5;stop-opacity:1;" offset="0.859375" />
          <stop style="stop-color:#ce06c4;stop-opacity:1;" offset="0.863281" />
          <stop style="stop-color:#cf06c4;stop-opacity:1;" offset="0.867188" />
          <stop style="stop-color:#d006c3;stop-opacity:1;" offset="0.871094" />
          <stop style="stop-color:#d105c2;stop-opacity:1;" offset="0.875" />
          <stop style="stop-color:#d105c2;stop-opacity:1;" offset="0.878906" />
          <stop style="stop-color:#d205c1;stop-opacity:1;" offset="0.882812" />
          <stop style="stop-color:#d305c1;stop-opacity:1;" offset="0.886719" />
          <stop style="stop-color:#d405c0;stop-opacity:1;" offset="0.890625" />
          <stop style="stop-color:#d404bf;stop-opacity:1;" offset="0.894531" />
          <stop style="stop-color:#d504bf;stop-opacity:1;" offset="0.898438" />
          <stop style="stop-color:#d604be;stop-opacity:1;" offset="0.902344" />
          <stop style="stop-color:#d604bd;stop-opacity:1;" offset="0.90625" />
          <stop style="stop-color:#d704bd;stop-opacity:1;" offset="0.910156" />
          <stop style="stop-color:#d804bc;stop-opacity:1;" offset="0.914062" />
          <stop style="stop-color:#d903bc;stop-opacity:1;" offset="0.917969" />
          <stop style="stop-color:#d903bb;stop-opacity:1;" offset="0.921875" />
          <stop style="stop-color:#da03ba;stop-opacity:1;" offset="0.925781" />
          <stop style="stop-color:#db03ba;stop-opacity:1;" offset="0.929688" />
          <stop style="stop-color:#dc03b9;stop-opacity:1;" offset="0.933594" />
          <stop style="stop-color:#dc02b8;stop-opacity:1;" offset="0.9375" />
          <stop style="stop-color:#dd02b8;stop-opacity:1;" offset="0.941406" />
          <stop style="stop-color:#de02b7;stop-opacity:1;" offset="0.945313" />
          <stop style="stop-color:#de02b7;stop-opacity:1;" offset="0.949219" />
          <stop style="stop-color:#df02b6;stop-opacity:1;" offset="0.953125" />
          <stop style="stop-color:#e002b5;stop-opacity:1;" offset="0.957031" />
          <stop style="stop-color:#e101b5;stop-opacity:1;" offset="0.960938" />
          <stop style="stop-color:#e101b4;stop-opacity:1;" offset="0.964844" />
          <stop style="stop-color:#e201b3;stop-opacity:1;" offset="0.96875" />
          <stop style="stop-color:#e301b3;stop-opacity:1;" offset="0.972656" />
          <stop style="stop-color:#e401b2;stop-opacity:1;" offset="0.976563" />
          <stop style="stop-color:#e400b1;stop-opacity:1;" offset="0.980469" />
          <stop style="stop-color:#e500b1;stop-opacity:1;" offset="0.984375" />
          <stop style="stop-color:#e500b0;stop-opacity:1;" offset="0.988281" />
          <stop style="stop-color:#e600b0;stop-opacity:1;" offset="0.992188" />
          <stop style="stop-color:#e600b0;stop-opacity:1;" offset="1" />
        </linearGradient>
      </defs>
      <g id="9e3f522ef7">
        <g clipRule="nonzero" clip-path="url(#1930dbcb93)">
          <g clipRule="nonzero" clip-path="url(#d0bcfb60c7)">
            <path
              style=" stroke:none;fill-rule:nonzero;fill:url(#f215e67af0);"
              d="M 483.992188 799.300781 L 483.992188 640.3125 L 325.761719 640.3125 L 325.761719 799.300781 Z M 483.992188 799.300781 "
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default BigWave;
