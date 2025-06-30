import React from 'react';

interface SmallWaveProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
  stroke?: string;
}

const SmallWave: React.FC<SmallWaveProps> = ({
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
        <clipPath id="c221d46dd1">
          <path d="M 361.632812 676.46875 L 448.632812 676.46875 L 448.632812 763.46875 L 361.632812 763.46875 Z M 361.632812 676.46875 " />
        </clipPath>
        <clipPath id="01e8cd65ef">
          <path d="M 432.878906 721.128906 L 432.894531 720.566406 L 447.761719 720.886719 L 447.738281 721.730469 Z M 445.273438 723.265625 L 445.335938 722.464844 L 439.300781 722.089844 L 439.25 722.769531 Z M 446.214844 725.027344 L 446.316406 724.207031 L 437.496094 723.308594 L 437.414062 723.953125 Z M 442.632812 726.144531 L 442.699219 725.765625 L 442.75 725.390625 L 434.089844 724.15625 L 434.054688 724.445312 L 434 724.730469 Z M 447.507812 728.71875 C 447.566406 728.4375 447.613281 728.15625 447.664062 727.871094 L 436.585938 725.824219 C 436.546875 726.035156 436.515625 726.246094 436.472656 726.453125 Z M 445.648438 730.070312 L 445.835938 729.257812 L 434.5 726.679688 L 434.363281 727.265625 Z M 443.742188 731.28125 L 443.960938 730.507812 L 438.207031 728.949219 L 438.019531 729.605469 Z M 446.648438 733.984375 L 446.929688 733.152344 L 433.863281 729.039062 L 433.675781 729.601562 Z M 444.941406 735.238281 C 445.042969 734.972656 445.15625 734.710938 445.246094 734.441406 L 432.082031 729.695312 C 432.023438 729.882812 431.941406 730.046875 431.875 730.226562 Z M 441.539062 735.652344 C 441.652344 735.414062 441.75 735.167969 441.84375 734.921875 L 430.378906 730.246094 C 430.3125 730.417969 430.25 730.585938 430.167969 730.75 Z M 439.394531 736.40625 L 439.710938 735.714844 L 434.242188 733.222656 L 433.976562 733.800781 Z M 442.777344 739.972656 L 443.167969 739.222656 L 429.910156 732.496094 L 429.65625 732.992188 Z M 439.878906 740.285156 L 440.28125 739.589844 L 435 736.636719 L 434.660156 737.230469 Z M 439.960938 742.28125 L 440.40625 741.585938 L 432.863281 736.949219 L 432.511719 737.492188 Z M 436.242188 741.726562 L 436.679688 741.105469 L 429.417969 736.25 L 429.078125 736.722656 Z M 439.5 746.15625 C 439.679688 745.929688 439.855469 745.703125 440.019531 745.46875 L 430.941406 738.820312 C 430.824219 738.996094 430.6875 739.164062 430.566406 739.328125 Z M 437.246094 746.566406 C 437.433594 746.359375 437.59375 746.136719 437.769531 745.917969 L 428.683594 738.683594 C 428.558594 738.839844 428.441406 739.003906 428.308594 739.152344 Z M 434.996094 746.84375 L 435.527344 746.238281 L 431.019531 742.34375 L 430.570312 742.859375 Z M 436.433594 750.53125 L 437.039062 749.902344 L 427.066406 740.539062 L 426.648438 740.976562 Z M 434.359375 750.917969 L 434.976562 750.332031 L 425.179688 740.363281 L 424.765625 740.757812 Z M 431.101562 749.8125 L 431.699219 749.296875 L 423.402344 740.132812 L 422.988281 740.488281 Z M 428.835938 749.566406 C 429.035156 749.410156 429.242188 749.261719 429.429688 749.09375 L 425.589844 744.488281 C 425.429688 744.632812 425.253906 744.753906 425.089844 744.886719 Z M 430.347656 754.253906 L 430.691406 754.003906 L 431.027344 753.746094 L 421.992188 741.96875 L 421.773438 742.140625 L 421.546875 742.300781 Z M 427.582031 753.296875 C 427.808594 753.148438 428.023438 752.988281 428.242188 752.835938 L 424.769531 747.902344 C 424.582031 748.035156 424.390625 748.171875 424.203125 748.296875 Z M 426.789062 755.128906 L 427.488281 754.6875 L 422.695312 747.253906 L 422.144531 747.605469 Z M 423.679688 753.023438 L 424.339844 752.648438 L 419.914062 745.132812 L 419.40625 745.425781 Z M 424.695312 758.421875 L 425.464844 758.027344 L 420.164062 748.121094 L 419.597656 748.410156 Z M 422.476562 757.816406 L 423.234375 757.472656 L 418.191406 747.03125 L 417.644531 747.277344 Z M 420.34375 757.09375 C 420.59375 756.996094 420.84375 756.90625 421.085938 756.785156 L 418.71875 751.335938 C 418.515625 751.433594 418.300781 751.515625 418.089844 751.597656 Z M 420.039062 761.046875 C 420.316406 760.957031 420.585938 760.839844 420.859375 760.738281 L 415.945312 747.992188 C 415.753906 748.0625 415.566406 748.148438 415.378906 748.207031 Z M 417.992188 760.5 L 418.800781 760.226562 L 414.3125 747.011719 L 413.773438 747.199219 Z M 415.539062 758.089844 L 416.300781 757.875 L 412.824219 746.039062 L 412.300781 746.1875 Z M 413.609375 756.886719 L 414.347656 756.714844 L 412.898438 750.90625 L 412.277344 751.046875 Z M 412.910156 761.753906 L 413.746094 761.601562 L 410.761719 747.082031 L 410.214844 747.175781 Z M 410.859375 759.695312 L 411.257812 759.644531 L 411.65625 759.574219 L 410.6875 753.628906 L 410.347656 753.6875 L 410.011719 753.730469 Z M 409.351562 761.011719 L 410.171875 760.910156 L 409.105469 752.140625 L 408.460938 752.21875 Z M 407.464844 757.761719 L 408.21875 757.703125 L 407.519531 749.015625 L 406.9375 749.0625 Z M 406.023438 763.054688 L 406.886719 763.03125 L 406.441406 751.816406 L 405.800781 751.832031 Z M 404.296875 761.550781 L 405.128906 761.574219 L 405.128906 749.984375 L 404.527344 749.964844 Z M 402.691406 759.980469 L 403.09375 760.007812 L 403.496094 760.019531 L 403.738281 754.082031 L 403.394531 754.074219 L 403.054688 754.046875 Z M 400.695312 763.414062 L 401.570312 763.480469 L 402.679688 749.875 L 402.078125 749.828125 Z M 399.089844 762.027344 L 399.9375 762.136719 L 401.636719 748.289062 L 401.070312 748.21875 Z M 397.925781 758.800781 L 398.703125 758.9375 L 400.710938 746.757812 L 400.171875 746.660156 Z M 396.703125 756.882812 L 397.445312 757.050781 L 398.660156 751.1875 L 398.035156 751.046875 Z M 393.960938 760.972656 C 394.234375 761.046875 394.507812 761.132812 394.785156 761.191406 L 398.394531 746.8125 C 398.207031 746.777344 398.039062 746.71875 397.859375 746.667969 Z M 393.003906 758.238281 C 393.257812 758.328125 393.519531 758.390625 393.777344 758.46875 L 395.472656 752.6875 C 395.253906 752.621094 395.035156 752.570312 394.816406 752.5 Z M 391.066406 758.765625 L 391.851562 759.03125 L 394.703125 750.664062 L 394.085938 750.457031 Z M 390.777344 755.023438 L 391.472656 755.296875 L 394.621094 747.167969 L 394.078125 746.953125 Z M 387.167969 759.167969 L 387.960938 759.523438 L 392.445312 749.226562 L 391.863281 748.964844 Z M 386.265625 757.066406 L 387.007812 757.441406 L 392.070312 747.011719 L 391.535156 746.734375 Z M 385.511719 754.953125 C 385.742188 755.082031 385.972656 755.222656 386.214844 755.339844 L 389.027344 750.101562 C 388.820312 750 388.625 749.882812 388.425781 749.769531 Z M 382.191406 757.175781 C 382.4375 757.339844 382.695312 757.476562 382.949219 757.625 L 389.894531 745.859375 C 389.726562 745.757812 389.546875 745.667969 389.378906 745.550781 Z M 381.347656 755.242188 L 382.066406 755.703125 L 389.652344 743.980469 L 389.171875 743.671875 Z M 381.710938 751.828125 L 382.355469 752.285156 L 389.492188 742.191406 L 389.046875 741.875 Z M 381.453125 749.574219 L 382.050781 750.042969 L 385.707031 745.289062 L 385.203125 744.894531 Z M 377.203125 752.066406 L 377.847656 752.628906 L 387.375 741.242188 L 386.953125 740.878906 Z M 377.539062 749.1875 C 377.726562 749.375 377.917969 749.5625 378.125 749.738281 L 382.183594 745.269531 C 382.011719 745.117188 381.851562 744.957031 381.683594 744.800781 Z M 375.566406 748.828125 L 375.847656 749.125 L 376.148438 749.410156 L 382.359375 743.105469 L 382.125 742.882812 L 381.902344 742.648438 Z M 376.929688 745.339844 C 377.09375 745.527344 377.273438 745.714844 377.449219 745.894531 L 383.832031 739.921875 C 383.699219 739.78125 383.558594 739.644531 383.433594 739.496094 Z M 371.871094 747.519531 L 372.4375 748.175781 L 380.957031 740.832031 L 380.535156 740.351562 Z M 371.972656 745.234375 L 372.492188 745.890625 L 381.585938 738.664062 L 381.207031 738.191406 Z M 372.210938 743 L 372.679688 743.648438 L 377.488281 740.136719 L 377.09375 739.574219 Z M 368.28125 743.578125 L 368.746094 744.3125 L 380.125 736.699219 L 379.800781 736.195312 Z M 368.359375 741.472656 C 368.503906 741.714844 368.636719 741.96875 368.792969 742.203125 L 380.722656 734.894531 C 380.613281 734.738281 380.535156 734.570312 380.433594 734.40625 Z M 370.160156 738.550781 C 370.277344 738.789062 370.410156 739.015625 370.539062 739.242188 L 381.347656 733.214844 C 381.257812 733.054688 381.15625 732.902344 381.082031 732.738281 Z M 370.898438 736.410156 L 371.246094 737.085938 L 376.605469 734.375 L 376.3125 733.8125 Z M 365.984375 736.816406 L 366.335938 737.59375 L 379.875 731.4375 L 379.644531 730.9375 Z M 367.542969 734.363281 L 367.839844 735.117188 L 373.441406 732.84375 L 373.1875 732.207031 Z M 365.917969 733.183594 L 366.183594 733.964844 L 374.527344 730.972656 L 374.320312 730.355469 Z M 368.671875 730.628906 C 368.742188 730.871094 368.804688 731.117188 368.886719 731.355469 L 377.234375 728.738281 C 377.167969 728.550781 377.125 728.363281 377.070312 728.175781 Z M 363.160156 730.402344 C 363.222656 730.6875 363.300781 730.96875 363.382812 731.238281 L 374.257812 728.3125 C 374.199219 728.109375 374.136719 727.90625 374.097656 727.695312 Z M 364.242188 728.390625 L 364.429688 729.203125 L 375.773438 726.640625 L 375.636719 726.058594 Z M 365.4375 726.476562 L 365.578125 727.269531 L 371.445312 726.191406 L 371.324219 725.519531 Z M 361.644531 725.292969 L 361.757812 726.15625 L 375.324219 724.238281 L 375.25 723.644531 Z M 362.640625 723.429688 L 362.707031 724.277344 L 376.640625 722.878906 L 376.597656 722.316406 Z M 365.542969 721.585938 L 365.554688 721.980469 L 365.582031 722.371094 L 377.949219 721.632812 L 377.925781 721.363281 L 377.925781 721.089844 Z M 367.140625 719.980469 L 367.160156 720.730469 L 373.167969 720.613281 L 373.152344 719.972656 Z M 362.539062 718.226562 L 362.523438 719.074219 L 377.398438 719.386719 L 377.414062 718.820312 Z M 365.011719 716.695312 L 364.949219 717.492188 L 370.984375 717.871094 L 371.035156 717.1875 Z M 364.066406 714.929688 L 363.964844 715.75 L 372.785156 716.648438 L 372.871094 716.003906 Z M 367.648438 713.816406 L 367.585938 714.191406 L 367.535156 714.566406 L 376.191406 715.804688 L 376.230469 715.515625 L 376.285156 715.226562 Z M 362.777344 711.238281 C 362.71875 711.523438 362.671875 711.804688 362.617188 712.089844 L 373.699219 714.136719 C 373.734375 713.925781 373.769531 713.714844 373.8125 713.507812 Z M 364.636719 709.890625 L 364.445312 710.703125 L 375.785156 713.277344 L 375.921875 712.695312 Z M 366.539062 708.679688 L 366.320312 709.457031 L 372.074219 711.015625 L 372.265625 710.359375 Z M 363.636719 705.972656 L 363.355469 706.804688 L 376.421875 710.921875 L 376.609375 710.355469 Z M 365.332031 704.722656 C 365.230469 704.984375 365.117188 705.246094 365.027344 705.515625 L 378.195312 710.265625 C 378.25 710.078125 378.332031 709.910156 378.398438 709.734375 Z M 368.746094 704.304688 C 368.632812 704.542969 368.535156 704.789062 368.441406 705.035156 L 379.90625 709.710938 C 379.972656 709.542969 380.035156 709.371094 380.117188 709.210938 Z M 370.890625 703.554688 L 370.574219 704.242188 L 376.042969 706.738281 L 376.308594 706.15625 Z M 367.507812 699.984375 L 367.117188 700.738281 L 380.378906 707.460938 L 380.628906 706.96875 Z M 370.40625 699.675781 L 370.003906 700.371094 L 375.285156 703.320312 L 375.625 702.730469 Z M 370.324219 697.679688 L 369.878906 698.359375 L 377.421875 702.996094 L 377.773438 702.453125 Z M 374.042969 698.230469 L 373.605469 698.851562 L 380.859375 703.722656 L 381.199219 703.25 Z M 370.796875 693.789062 C 370.605469 694.015625 370.4375 694.242188 370.273438 694.480469 L 379.351562 701.128906 C 379.472656 700.949219 379.605469 700.785156 379.730469 700.617188 Z M 373.058594 693.378906 C 372.871094 693.585938 372.710938 693.808594 372.535156 694.027344 L 381.621094 701.261719 C 381.746094 701.105469 381.859375 700.941406 381.996094 700.792969 Z M 375.289062 693.113281 L 374.757812 693.71875 L 379.265625 697.617188 L 379.714844 697.097656 Z M 373.851562 689.421875 L 373.246094 690.054688 L 383.222656 699.414062 L 383.636719 698.980469 Z M 375.925781 689.035156 L 375.308594 689.621094 L 385.113281 699.589844 L 385.527344 699.195312 Z M 379.183594 690.144531 L 378.585938 690.660156 L 386.882812 699.820312 L 387.296875 699.464844 Z M 381.449219 690.386719 C 381.257812 690.546875 381.042969 690.695312 380.855469 690.863281 L 384.699219 695.464844 C 384.859375 695.324219 385.03125 695.199219 385.195312 695.066406 Z M 379.941406 685.703125 L 379.59375 685.949219 L 379.257812 686.210938 L 388.292969 697.988281 L 388.511719 697.816406 L 388.738281 697.65625 Z M 382.703125 686.664062 C 382.476562 686.8125 382.261719 686.96875 382.042969 687.125 L 385.515625 692.054688 C 385.703125 691.921875 385.894531 691.789062 386.082031 691.664062 Z M 383.496094 684.828125 L 382.796875 685.269531 L 387.59375 692.703125 L 388.132812 692.363281 Z M 386.605469 686.933594 L 385.945312 687.308594 L 390.371094 694.824219 L 390.878906 694.53125 Z M 385.589844 681.539062 L 384.820312 681.933594 L 390.121094 691.839844 L 390.6875 691.546875 Z M 387.808594 682.140625 L 387.054688 682.484375 L 392.09375 692.925781 L 392.640625 692.679688 Z M 389.941406 682.863281 C 389.691406 682.964844 389.441406 683.050781 389.199219 683.171875 L 391.566406 688.621094 C 391.769531 688.523438 391.984375 688.433594 392.195312 688.359375 Z M 390.25 678.917969 C 389.972656 679.011719 389.703125 679.128906 389.429688 679.230469 L 394.347656 691.976562 C 394.535156 691.90625 394.722656 691.820312 394.914062 691.761719 Z M 392.300781 679.46875 L 391.488281 679.742188 L 395.972656 692.953125 L 396.511719 692.765625 Z M 394.753906 681.878906 L 393.988281 682.09375 L 397.46875 693.941406 L 397.992188 693.792969 Z M 396.683594 683.082031 L 395.941406 683.253906 L 397.390625 689.0625 L 398.015625 688.917969 Z M 397.382812 678.214844 L 396.542969 678.367188 L 399.527344 692.886719 L 400.074219 692.792969 Z M 399.433594 680.28125 L 399.03125 680.332031 L 398.636719 680.402344 L 399.605469 686.347656 L 399.941406 686.289062 L 400.28125 686.246094 Z M 400.941406 678.964844 L 400.117188 679.066406 L 401.183594 687.835938 L 401.828125 687.757812 Z M 402.828125 682.214844 L 402.074219 682.273438 L 402.769531 690.960938 L 403.355469 690.917969 Z M 404.269531 676.921875 L 403.40625 676.945312 L 403.847656 688.164062 L 404.492188 688.144531 Z M 405.996094 678.425781 L 405.160156 678.40625 L 405.160156 689.996094 L 405.765625 690.011719 Z M 407.601562 679.996094 L 407.21875 679.949219 L 406.816406 679.9375 L 406.570312 685.875 L 406.914062 685.882812 L 407.257812 685.910156 Z M 409.59375 676.5625 L 408.726562 676.476562 L 407.613281 690.082031 L 408.214844 690.128906 Z M 411.199219 677.949219 L 410.351562 677.839844 L 408.65625 691.6875 L 409.222656 691.757812 Z M 412.367188 681.179688 L 411.585938 681.039062 L 409.582031 693.21875 L 410.121094 693.316406 Z M 413.585938 683.09375 L 412.847656 682.925781 L 411.632812 688.789062 L 412.253906 688.929688 Z M 416.332031 679.003906 C 416.058594 678.929688 415.785156 678.847656 415.503906 678.785156 L 411.894531 693.164062 C 412.085938 693.199219 412.253906 693.257812 412.429688 693.308594 Z M 417.285156 681.738281 C 417.035156 681.652344 416.773438 681.585938 416.515625 681.511719 L 414.816406 687.269531 C 415.035156 687.335938 415.257812 687.386719 415.472656 687.457031 Z M 419.226562 681.214844 L 418.4375 680.945312 L 415.597656 689.292969 L 416.214844 689.5 Z M 419.511719 684.957031 L 418.8125 684.660156 L 415.664062 692.789062 L 416.207031 693.003906 Z M 423.121094 680.808594 L 422.332031 680.453125 L 417.855469 690.730469 L 418.4375 690.992188 Z M 424.027344 682.910156 L 423.28125 682.535156 L 418.230469 692.945312 L 418.765625 693.21875 Z M 424.78125 685.023438 C 424.546875 684.894531 424.320312 684.753906 424.078125 684.636719 L 421.265625 689.878906 C 421.46875 689.976562 421.664062 690.097656 421.863281 690.207031 Z M 428.09375 682.78125 C 427.847656 682.621094 427.589844 682.480469 427.339844 682.335938 L 420.390625 694.101562 C 420.5625 694.203125 420.738281 694.289062 420.90625 694.40625 Z M 428.9375 684.714844 L 428.21875 684.253906 L 420.632812 695.980469 L 421.113281 696.289062 Z M 428.574219 688.128906 L 427.929688 687.667969 L 420.792969 697.769531 L 421.238281 698.082031 Z M 428.832031 690.386719 L 428.234375 689.921875 L 424.578125 694.675781 L 425.082031 695.070312 Z M 433.082031 687.894531 L 432.4375 687.332031 L 422.910156 698.714844 L 423.332031 699.078125 Z M 432.746094 690.773438 C 432.558594 690.585938 432.359375 690.394531 432.160156 690.222656 L 428.101562 694.6875 C 428.273438 694.839844 428.433594 695.003906 428.601562 695.160156 Z M 434.722656 691.132812 L 434.4375 690.835938 L 434.136719 690.546875 L 427.925781 696.851562 L 428.160156 697.078125 L 428.382812 697.3125 Z M 433.355469 694.617188 C 433.191406 694.429688 433.011719 694.242188 432.835938 694.066406 L 426.460938 700.03125 C 426.59375 700.175781 426.738281 700.308594 426.863281 700.457031 Z M 438.414062 692.433594 L 437.847656 691.78125 L 429.328125 699.125 L 429.75 699.605469 Z M 438.3125 694.722656 L 437.792969 694.066406 L 428.703125 701.289062 L 429.078125 701.761719 Z M 438.074219 696.957031 L 437.605469 696.308594 L 432.796875 699.820312 L 433.191406 700.386719 Z M 442.003906 696.375 L 441.539062 695.644531 L 430.15625 703.257812 L 430.480469 703.765625 Z M 441.925781 698.484375 C 441.78125 698.238281 441.648438 697.988281 441.492188 697.753906 L 429.5625 705.0625 C 429.671875 705.21875 429.75 705.390625 429.855469 705.554688 Z M 440.125 701.402344 C 440.007812 701.167969 439.875 700.941406 439.75 700.710938 L 428.9375 706.742188 C 429.03125 706.898438 429.128906 707.050781 429.203125 707.214844 Z M 439.386719 703.546875 L 439.042969 702.882812 L 433.683594 705.59375 L 433.972656 706.15625 Z M 444.300781 703.136719 L 443.949219 702.363281 L 430.410156 708.519531 L 430.640625 709.023438 Z M 442.742188 705.589844 L 442.445312 704.839844 L 436.847656 707.113281 L 437.097656 707.746094 Z M 444.359375 706.769531 L 444.09375 705.988281 L 435.753906 708.984375 L 435.960938 709.597656 Z M 441.609375 709.324219 C 441.535156 709.082031 441.476562 708.835938 441.394531 708.597656 L 433.050781 711.21875 C 433.117188 711.40625 433.160156 711.59375 433.214844 711.78125 Z M 447.121094 709.550781 C 447.058594 709.269531 446.976562 708.988281 446.898438 708.714844 L 436.023438 711.640625 C 436.082031 711.847656 436.144531 712.050781 436.183594 712.257812 Z M 446.039062 711.566406 L 445.851562 710.753906 L 434.503906 713.3125 L 434.644531 713.898438 Z M 444.84375 713.476562 L 444.703125 712.6875 L 438.835938 713.761719 L 438.957031 714.433594 Z M 448.636719 714.664062 L 448.523438 713.796875 L 434.945312 715.714844 L 435.019531 716.308594 Z M 447.640625 716.523438 L 447.570312 715.679688 L 433.640625 717.074219 L 433.683594 717.636719 Z M 444.742188 718.375 L 444.730469 717.980469 L 444.703125 717.585938 L 432.335938 718.324219 L 432.359375 718.59375 L 432.359375 718.867188 Z M 443.144531 719.980469 L 443.125 719.226562 L 437.117188 719.347656 L 437.132812 719.984375 Z M 443.144531 719.980469 " />
        </clipPath>
        <linearGradient
          x1="250"
          gradientTransform="matrix(0.188575,0,0,0.187864,357.998992,673.01325)"
          y1="481.499836"
          x2="250"
          gradientUnits="userSpaceOnUse"
          y2="18.429999"
          id="7b40fc61ef"
        >
          <stop style="stop-color:#17fff3;stop-opacity:1;" offset="0" />
          <stop
            style="stop-color:#18fdf3;stop-opacity:1;"
            offset="0.00390625"
          />
          <stop style="stop-color:#19fbf3;stop-opacity:1;" offset="0.0078125" />
          <stop style="stop-color:#1af9f3;stop-opacity:1;" offset="0.0117188" />
          <stop style="stop-color:#1bf8f3;stop-opacity:1;" offset="0.015625" />
          <stop style="stop-color:#1cf6f3;stop-opacity:1;" offset="0.0195312" />
          <stop style="stop-color:#1cf4f4;stop-opacity:1;" offset="0.0234375" />
          <stop style="stop-color:#1df2f4;stop-opacity:1;" offset="0.0273437" />
          <stop style="stop-color:#1ef0f4;stop-opacity:1;" offset="0.03125" />
          <stop style="stop-color:#1feff4;stop-opacity:1;" offset="0.0351562" />
          <stop style="stop-color:#20edf4;stop-opacity:1;" offset="0.0390625" />
          <stop style="stop-color:#21ebf4;stop-opacity:1;" offset="0.0429688" />
          <stop style="stop-color:#22e9f4;stop-opacity:1;" offset="0.046875" />
          <stop style="stop-color:#23e7f4;stop-opacity:1;" offset="0.0507813" />
          <stop style="stop-color:#24e6f4;stop-opacity:1;" offset="0.0546875" />
          <stop style="stop-color:#25e4f4;stop-opacity:1;" offset="0.0585938" />
          <stop style="stop-color:#25e2f5;stop-opacity:1;" offset="0.0625" />
          <stop style="stop-color:#26e0f5;stop-opacity:1;" offset="0.0664062" />
          <stop style="stop-color:#27def5;stop-opacity:1;" offset="0.0703125" />
          <stop style="stop-color:#28dcf5;stop-opacity:1;" offset="0.0742188" />
          <stop style="stop-color:#29dbf5;stop-opacity:1;" offset="0.078125" />
          <stop style="stop-color:#2ad9f5;stop-opacity:1;" offset="0.0820313" />
          <stop style="stop-color:#2bd7f5;stop-opacity:1;" offset="0.0859375" />
          <stop style="stop-color:#2cd5f5;stop-opacity:1;" offset="0.0898438" />
          <stop style="stop-color:#2dd3f5;stop-opacity:1;" offset="0.09375" />
          <stop style="stop-color:#2ed2f5;stop-opacity:1;" offset="0.0976563" />
          <stop style="stop-color:#2fd0f5;stop-opacity:1;" offset="0.101563" />
          <stop style="stop-color:#2fcef6;stop-opacity:1;" offset="0.105469" />
          <stop style="stop-color:#30ccf6;stop-opacity:1;" offset="0.109375" />
          <stop style="stop-color:#31caf6;stop-opacity:1;" offset="0.113281" />
          <stop style="stop-color:#32c9f6;stop-opacity:1;" offset="0.117188" />
          <stop style="stop-color:#33c7f6;stop-opacity:1;" offset="0.121094" />
          <stop style="stop-color:#34c5f6;stop-opacity:1;" offset="0.125" />
          <stop style="stop-color:#35c3f6;stop-opacity:1;" offset="0.128906" />
          <stop style="stop-color:#36c1f6;stop-opacity:1;" offset="0.132813" />
          <stop style="stop-color:#37bff6;stop-opacity:1;" offset="0.136719" />
          <stop style="stop-color:#38bef6;stop-opacity:1;" offset="0.140625" />
          <stop style="stop-color:#39bcf6;stop-opacity:1;" offset="0.144531" />
          <stop style="stop-color:#39baf7;stop-opacity:1;" offset="0.148438" />
          <stop style="stop-color:#3ab8f7;stop-opacity:1;" offset="0.152344" />
          <stop style="stop-color:#3bb6f7;stop-opacity:1;" offset="0.15625" />
          <stop style="stop-color:#3cb5f7;stop-opacity:1;" offset="0.160156" />
          <stop style="stop-color:#3db3f7;stop-opacity:1;" offset="0.164062" />
          <stop style="stop-color:#3eb1f7;stop-opacity:1;" offset="0.167969" />
          <stop style="stop-color:#3faff7;stop-opacity:1;" offset="0.171875" />
          <stop style="stop-color:#40adf7;stop-opacity:1;" offset="0.175781" />
          <stop style="stop-color:#41acf7;stop-opacity:1;" offset="0.179688" />
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
          <stop style="stop-color:#5680fa;stop-opacity:1;" offset="0.273437" />
          <stop style="stop-color:#577efa;stop-opacity:1;" offset="0.277344" />
          <stop style="stop-color:#587cfa;stop-opacity:1;" offset="0.28125" />
          <stop style="stop-color:#597bfa;stop-opacity:1;" offset="0.285156" />
          <stop style="stop-color:#5a79fa;stop-opacity:1;" offset="0.289062" />
          <stop style="stop-color:#5b77fa;stop-opacity:1;" offset="0.292969" />
          <stop style="stop-color:#5c75fa;stop-opacity:1;" offset="0.296875" />
          <stop style="stop-color:#5d73fa;stop-opacity:1;" offset="0.300781" />
          <stop style="stop-color:#5e72fa;stop-opacity:1;" offset="0.304687" />
          <stop style="stop-color:#5f70fa;stop-opacity:1;" offset="0.308594" />
          <stop style="stop-color:#5f6efb;stop-opacity:1;" offset="0.3125" />
          <stop style="stop-color:#606cfb;stop-opacity:1;" offset="0.316406" />
          <stop style="stop-color:#616afb;stop-opacity:1;" offset="0.320312" />
          <stop style="stop-color:#6268fb;stop-opacity:1;" offset="0.324219" />
          <stop style="stop-color:#6367fb;stop-opacity:1;" offset="0.328125" />
          <stop style="stop-color:#6465fb;stop-opacity:1;" offset="0.332031" />
          <stop style="stop-color:#6563fb;stop-opacity:1;" offset="0.335938" />
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
          <stop style="stop-color:#773ffd;stop-opacity:1;" offset="0.414063" />
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
          <stop style="stop-color:#8c17fe;stop-opacity:1;" offset="0.507812" />
          <stop style="stop-color:#8d16fd;stop-opacity:1;" offset="0.511719" />
          <stop style="stop-color:#8e16fc;stop-opacity:1;" offset="0.515625" />
          <stop style="stop-color:#8f16fc;stop-opacity:1;" offset="0.519531" />
          <stop style="stop-color:#8f16fb;stop-opacity:1;" offset="0.523438" />
          <stop style="stop-color:#9016fb;stop-opacity:1;" offset="0.527344" />
          <stop style="stop-color:#9115fa;stop-opacity:1;" offset="0.53125" />
          <stop style="stop-color:#9215f9;stop-opacity:1;" offset="0.535156" />
          <stop style="stop-color:#9215f9;stop-opacity:1;" offset="0.539062" />
          <stop style="stop-color:#9315f8;stop-opacity:1;" offset="0.542969" />
          <stop style="stop-color:#9415f7;stop-opacity:1;" offset="0.546875" />
          <stop style="stop-color:#9415f7;stop-opacity:1;" offset="0.550781" />
          <stop style="stop-color:#9514f6;stop-opacity:1;" offset="0.554688" />
          <stop style="stop-color:#9614f6;stop-opacity:1;" offset="0.558594" />
          <stop style="stop-color:#9714f5;stop-opacity:1;" offset="0.5625" />
          <stop style="stop-color:#9714f4;stop-opacity:1;" offset="0.566406" />
          <stop style="stop-color:#9814f4;stop-opacity:1;" offset="0.570312" />
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
          <stop style="stop-color:#b50cda;stop-opacity:1;" offset="0.726562" />
          <stop style="stop-color:#b60cda;stop-opacity:1;" offset="0.730469" />
          <stop style="stop-color:#b70cd9;stop-opacity:1;" offset="0.734375" />
          <stop style="stop-color:#b70cd9;stop-opacity:1;" offset="0.738281" />
          <stop style="stop-color:#b80cd8;stop-opacity:1;" offset="0.742188" />
          <stop style="stop-color:#b90bd7;stop-opacity:1;" offset="0.746094" />
          <stop style="stop-color:#b90bd7;stop-opacity:1;" offset="0.75" />
          <stop style="stop-color:#ba0bd6;stop-opacity:1;" offset="0.753906" />
          <stop style="stop-color:#bb0bd5;stop-opacity:1;" offset="0.757812" />
          <stop style="stop-color:#bc0bd5;stop-opacity:1;" offset="0.761719" />
          <stop style="stop-color:#bc0bd4;stop-opacity:1;" offset="0.765625" />
          <stop style="stop-color:#bd0ad4;stop-opacity:1;" offset="0.769531" />
          <stop style="stop-color:#be0ad3;stop-opacity:1;" offset="0.773438" />
          <stop style="stop-color:#bf0ad2;stop-opacity:1;" offset="0.777344" />
          <stop style="stop-color:#bf0ad2;stop-opacity:1;" offset="0.78125" />
          <stop style="stop-color:#c00ad1;stop-opacity:1;" offset="0.785156" />
          <stop style="stop-color:#c109d0;stop-opacity:1;" offset="0.789062" />
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
          <stop style="stop-color:#d205c1;stop-opacity:1;" offset="0.882813" />
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
          <stop style="stop-color:#de02b7;stop-opacity:1;" offset="0.945312" />
          <stop style="stop-color:#de02b7;stop-opacity:1;" offset="0.949219" />
          <stop style="stop-color:#df02b6;stop-opacity:1;" offset="0.953125" />
          <stop style="stop-color:#e002b5;stop-opacity:1;" offset="0.957031" />
          <stop style="stop-color:#e101b5;stop-opacity:1;" offset="0.960938" />
          <stop style="stop-color:#e101b4;stop-opacity:1;" offset="0.964844" />
          <stop style="stop-color:#e201b3;stop-opacity:1;" offset="0.96875" />
          <stop style="stop-color:#e301b3;stop-opacity:1;" offset="0.972656" />
          <stop style="stop-color:#e401b2;stop-opacity:1;" offset="0.976562" />
          <stop style="stop-color:#e400b1;stop-opacity:1;" offset="0.980469" />
          <stop style="stop-color:#e500b1;stop-opacity:1;" offset="0.984375" />
          <stop style="stop-color:#e500b0;stop-opacity:1;" offset="0.988281" />
          <stop style="stop-color:#e600b0;stop-opacity:1;" offset="0.992188" />
          <stop style="stop-color:#e600b0;stop-opacity:1;" offset="1" />
        </linearGradient>
      </defs>
      <g id="7b5f95a982">
        <g clipRule="nonzero" clip-path="url(#c221d46dd1)">
          <g clipRule="nonzero" clip-path="url(#01e8cd65ef)">
            <path
              style=" stroke:none;fill-rule:nonzero;fill:url(#7b40fc61ef);"
              d="M 361.644531 676.476562 L 361.644531 763.46875 L 448.632812 763.46875 L 448.632812 676.476562 Z M 361.644531 676.476562 "
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default SmallWave;
