<?php 
if (!function_exists('format_number_to_money')) {
    function format_number_to_money($number)
    {
        return number_format ($number , $decimals = 0 , $dec_point = "," , $thousands_sep = "," );
    }
}
?>