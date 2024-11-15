import React from 'react';

const InteractiveTableSkeleton = () => {
    const columnsPlaceholder = Array(4).fill(''); // Adjust the number of columns as needed
    const rowsPlaceholder = Array(6).fill(Array(4).fill('')); // Adjust the number of rows as needed

    return (
        <div class="animate-pulse fade-out fade-out-active">
            <h1
                aria-hidden="true"
                class="text-2xl font-bold dark:text-gray-100 bg-gray-300 dark:bg-gray-700 rounded h-6 w-36  mb-1 "
            ></h1>

            {/* Buttons Placeholder */}
            <div>
                <div class="inline-block h-6 w-8 bg-gray-300 dark:bg-gray-700 rounded "></div>
                {/* <div class="inline-block h-4 w-8 bg-gray-300 dark:bg-gray-700 rounded ml-4 "></div> */}
            </div>

            <div class="table-button-container flex relative overflow-x-auto">
                <table class="dark:bg-gray-800 w-full text-base text-left">
                    <thead>
                        <tr>
                            {columnsPlaceholder.map((_, index) => (
                                <th
                                    key={index}
                                    class="px-6 py-6 border border-black bg-gray-300 dark:bg-gray-700 h-4"
                                ></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowsPlaceholder.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                class="bg-white dark:bg-gray-700 border border-black"
                            >
                                {row.map((_, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        class={` ${rowIndex === 5 ? 'bg-gray-100 px-6 py-2' : 'px-6 py-10 border-r border-black bg-gray-300 dark:bg-gray-700'} `}
                                    ></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InteractiveTableSkeleton;
